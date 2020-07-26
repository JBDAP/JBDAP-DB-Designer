<template>
    <div id="indexesDesigner" style="padding: 15px 20px;">
        <a-card size="small" :title="keyType+'键管理'" style="">
            <span slot="extra">操作</span>
            <div v-for="(item,index) in indexesData" :key="item.join('-')">
                <a-row style="font-size:14px;line-height:40px;border-bottom:solid 1px #e5e5e5;">
                    <a-col :span="18" style="padding-left: 15px;">
                        <template v-if="currentKeyIndex !== index">{{ item.join(' + ') }}</template>
                        <template v-if="currentKeyIndex === index">
                            <a-select v-model="currentKeyItems" size="small" mode="multiple" style="width: 100%" placeholder="请选择(可选多个生成组合键)" allowClear>
                                <a-select-option v-for="i in columns" :key="i">{{ i }}</a-select-option>
                            </a-select>
                        </template>
                    </a-col>
                    <a-col :span="6" style="text-align:right;padding-right:15px;">
                        <div v-if="currentKeyIndex !== index">
                            <a @click="edit(index)"><a-icon type="edit" /></a>
                            <a @click="moveUp(index)"><a-icon type="arrow-up" /></a>
                            <a @click="moveDown(index)"><a-icon type="arrow-down" /></a>
                            <a @click="remove(index)"><a-icon type="delete" /></a>
                        </div>
                        <div v-if="currentKeyIndex == index" style="font-size:13px;">
                            <a @click="save(index)"><a-icon type="save" /> 保存</a>
                            &nbsp;
                            <a @click="cancel(index)"><a-icon type="reload" /> 放弃</a>
                        </div>
                    </a-col>
                </a-row>
            </div>
            <div style="height:40px;line-height:40px;padding-left:5px;">
                <a-button slot="extra" @click="addIndex" :disabled="disabled" size="small" type="link" icon="plus">创建{{keyType}}键</a-button>
            </div>
        </a-card>
        <a-alert
            :message="`${keyType}键须知`"
            type="info"
            show-icon
            style="margin-top: 10px;"
        >
            <div slot="description">
                <template v-if="keyType === '唯一'">
                    1、唯一键可以是单个字段，也可以是多个字段的组合
                    <br/>
                    2、唯一键意味着不能存在此字段(或字段组合)值完全相同的两行数据
                    <br/>
                    3、对于组合唯一键来说，其内部字段元素顺序并不重要，只要含有一组相同字段元素就视作相等
                    <br/>
                    4、数据库会自动为主键创建唯一键，无需手动创建
                </template>
                <template v-if="keyType === '索引'">
                    1、索引键可以是单个字段，也可以是多个字段的组合
                    <br/>
                    2、为经常被查询的字段创建索引键可以加快查询速度，但也会拖慢写入速度
                    <br/>
                    3、对于组合键来说，其内部字段元素顺序并不重要，只要含有一组相同字段元素就视作相等
                    <br/>
                    4、对于主键和已经声明为唯一键的字段(或字段组合)，无需再次创建索引
                </template>
            </div>
        </a-alert>
    </div>
</template>
<script>
export default {
    props: [
        'data',
        'keyType'
    ],
    data() {
        return {
            disabled: true,
            currentKeyIndex: undefined,
            currentKeyItems: undefined,
            indexesData: _.cloneDeep(this.data),
        }
    },
    computed: {
        columns() {
            return _.map(this.$store.state.currentSchema.columns, 'name')
        }
    },
    watch: {
    },
    methods: {
        // 新增字段
        addIndex() {
            this.currentKeyItems = []
            this.indexesData.push([])
            this.currentKeyIndex = this.indexesData.length - 1
        },
        // 编辑字段
        edit(idx) {
            this.currentKeyIndex = idx
            this.currentKeyItems = this.indexesData[idx]
        },
        // 重置表单
        cancel(idx) {
            if (this.indexesData[idx].length === 0) this.indexesData.splice(idx,1)
            this.currentKeyIndex = undefined
            this.currentKeyItems = []
            this.$emit('update',this.indexesData)
        },
        // 删除字段
        remove(idx) {
            this.indexesData.splice(idx,1)
            this.$emit('update',this.indexesData)
        },
        // 向上移动
        moveUp(idx) {
            if (idx - 1 < 0) return
            let clone = _.cloneDeep(this.indexesData)
            let self = _.cloneDeep(clone[idx])
            let target = _.cloneDeep(clone[idx - 1])
            clone[idx] = target
            clone[idx - 1] = self
            this.indexesData = clone
            this.$emit('update',this.indexesData)
        },
        // 向下移动
        moveDown(idx) {
            if (idx + 1 > this.indexesData.length - 1) return
            let clone = _.cloneDeep(this.indexesData)
            let self = _.cloneDeep(clone[idx])
            let target = _.cloneDeep(clone[idx + 1])
            clone[idx] = target
            clone[idx + 1] = self
            this.indexesData = clone
            this.$emit('update',this.indexesData)
        },
        // 保存表单
        save(idx) {
            if (this.currentKeyItems === undefined || this.currentKeyItems.length === 0) return
            // 检查冲突
            let rest = _.cloneDeep(this.indexesData).splice(idx,1)
            if (this.indexesData[idx].length === 0) rest = this.indexesData
            let yon = false
            _.each(rest, (items) => {
                if (JSON.stringify(_.cloneDeep(items).sort()) === JSON.stringify(_.cloneDeep(this.currentKeyItems).sort())) yon = true
            })
            if (yon === true) {
                this.$error({
                    title: '有重复',
                    content: '键或者组合已经存在，请仔细检查！',
                })
                return
            }
            this.indexesData[idx] = this.currentKeyItems
            this.currentKeyIndex = undefined
            this.currentKeyItems = []
            this.$emit('update',this.indexesData)
        },
        // 组件方法
        // 可用状态
        setDisabled(bool) {
            this.disabled = bool
        },
        // 设定数据
        setData(data) {
            this.indexesData = _.cloneDeep(data)
        },
        // 清空
        empty() {
            this.disabled = true
            this.indexesData = []
            this.currentKeyIndex = undefined
        }
    },
};
</script>
<style>
.ant-card-small > .ant-card-body {
    padding: 0;
}
</style>