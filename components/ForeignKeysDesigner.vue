<template>
    <div id="foreignKeysDesigner" style="padding: 15px 20px;">
        <a-card size="small" title="外键管理">
            <span slot="extra">操作</span>
            <div v-for="(item,index) in foreignKeysData" :key="`${item.selfColumn}-${item.targetTable}-${item.targetColumn}`">
                <a-row style="font-size:14px;line-height:40px;border-bottom:solid 1px #e5e5e5;">
                    <a-col :span="18" style="padding-left: 15px;">
                        <template v-if="currentForeignKeyIndex !== index">{{ $store.state.currentSchema.name }}.{{ item.selfColumn }} => {{ item.targetTable }}.{{ item.targetColumn }}</template>
                        <template v-if="currentForeignKeyIndex === index">
                            <a-select v-model="currentSelfColumn" size="small" mode="default" style="width: 30%" placeholder="本表字段" allowClear>
                                <a-select-option v-for="i in columns" :disabled="checkColumn(i)" :value="i" :key="i">{{ i }}</a-select-option>
                            </a-select>
                            <a-select v-model="currentTargetTable" size="small" mode="default" style="width: 30%" placeholder="外链表" allowClear>
                                <a-select-option v-for="i in targetTables" :key="i">{{ i }}</a-select-option>
                            </a-select>
                            <a-select v-if="currentTargetTable !== undefined" v-model="currentTargetColumn" size="small" mode="default" style="width: 30%" placeholder="链接字段" allowClear>
                                <a-select-option v-for="i in targetColumns" :key="i">{{ i }}</a-select-option>
                            </a-select>
                        </template>
                    </a-col>
                    <a-col :span="6" style="text-align:right;padding-right:15px;">
                        <div v-if="currentForeignKeyIndex !== index">
                            <a @click="edit(index)"><a-icon type="edit" /></a>
                            <a @click="moveUp(index)"><a-icon type="arrow-up" /></a>
                            <a @click="moveDown(index)"><a-icon type="arrow-down" /></a>
                            <a @click="remove(index)"><a-icon type="delete" /></a>
                        </div>
                        <div v-if="currentForeignKeyIndex == index" style="font-size:13px;">
                            <a @click="save(index)"><a-icon type="save" /> 保存</a>
                            &nbsp;
                            <a @click="cancel(index)"><a-icon type="reload" /> 放弃</a>
                        </div>
                    </a-col>
                </a-row>
            </div>
            <div style="height:40px;line-height:40px;padding-left:5px;">
                <a-button slot="extra" @click="addIndex" :disabled="disabled" size="small" type="link" icon="plus">创建外键</a-button>
            </div>
        </a-card>
        <a-alert
            message="外键须知"
            type="info"
            show-icon
            style="margin-top: 10px;"
        >
            <div slot="description">
                1、仅支持为 integer/bigInteger/string 类型的字段创建外键
                <br/>
                2、如果外链表中已经有添加了某个字段，但是它却没有出现在“链接字段”的备选列表中，请检查它的类型与本表字段是否完全相符（数据类型、长度、unsigned 都必须吻合）
            </div>
        </a-alert>
    </div>
</template>
<script>
export default {
    props: [
        'data',
    ],
    data() {
        return {
            disabled: true,
            currentForeignKeyIndex: undefined,
            currentSelfColumn: undefined,
            currentSelfColumnType: undefined,
            currentTargetTable: undefined,
            currentTargetColumn: undefined,
            foreignKeysData: _.cloneDeep(this.data),
        }
    },
    computed: {
        columns() {
            let cols = _.remove(_.cloneDeep(this.$store.state.currentSchema.columns), (col) => {
                return ['integer','bigInteger','string'].indexOf(col.type) >= 0
            })
            return _.map(cols, 'name')
        },
        targetTables() {
            return _.map(this.$store.state.currentProject.tables, 'name').sort()
        },
        targetColumns() {
            let selfColumn = _.cloneDeep(_.find(this.$store.state.currentSchema.columns, { name: this.currentSelfColumn}))
            let targetTable = _.cloneDeep(_.find(this.$store.state.currentProject.tables, { name: this.currentTargetTable }))
            // 如果数据表被改名，有可能找不到 targetTable
            if (targetTable === undefined) return []
            let cols = _.remove(targetTable.columns, (item) => {
                let allowed = []
                if (this.currentSelfColumnType === 'string') {
                    allowed = ['string']
                    return allowed.indexOf(item.type) >= 0 && item.length === selfColumn.length
                }
                if (this.currentSelfColumnType === 'integer') {
                    if (item.type === 'integer') return item.length === selfColumn.length && item.unsigned === selfColumn.unsigned
                    if (item.type === 'increments') return item.unsigned === selfColumn.unsigned
                }
                if (this.currentSelfColumnType === 'bigInteger') {
                    if (item.type === 'bigInteger') return item.length === selfColumn.length && item.unsigned === selfColumn.unsigned
                    if (item.type === 'bigIncrements') return item.unsigned === selfColumn.unsigned
                }
            })
            return _.map(cols, 'name')
        },
    },
    watch: {
        currentSelfColumn(nv,ov) {
            if (nv !== undefined) {
                this.currentSelfColumnType = _.find(this.$store.state.currentSchema.columns, { name: nv }).type
            }
            else this.currentSelfColumnType = undefined
        }
    },
    methods: {
        // 新增字段
        addIndex() {
            this.foreignKeysData.push({
                selfColumn: this.currentSelfColumn,
                targetTable: this.currentTargetTable,
                targetColumn: this.currentTargetColumn
            })
            this.currentForeignKeyIndex = this.foreignKeysData.length - 1
        },
        // 编辑字段
        edit(idx) {
            this.currentForeignKeyIndex = idx
            this.currentSelfColumn = this.foreignKeysData[idx].selfColumn
            this.currentTargetTable = this.foreignKeysData[idx].targetTable
            this.currentTargetColumn = this.foreignKeysData[idx].targetColumn
        },
        // 重置表单
        cancel(idx) {
            if (this.foreignKeysData[idx].selfColumn === undefined) this.foreignKeysData.splice(idx,1)
            this.currentForeignKeyIndex = undefined
            this.currentSelfColumn = undefined
            this.currentTargetTable = undefined
            this.currentTargetColumn = undefined
            this.$emit('update',this.foreignKeysData)
        },
        // 删除字段
        remove(idx) {
            this.foreignKeysData.splice(idx,1)
            this.$emit('update',this.foreignKeysData)
        },
        // 向上移动
        moveUp(idx) {
            if (idx - 1 < 0) return
            let clone = _.cloneDeep(this.foreignKeysData)
            let self = _.cloneDeep(clone[idx])
            let target = _.cloneDeep(clone[idx - 1])
            clone[idx] = target
            clone[idx - 1] = self
            this.foreignKeysData = clone
            this.$emit('update',this.foreignKeysData)
        },
        // 向下移动
        moveDown(idx) {
            if (idx + 1 > this.foreignKeysData.length - 1) return
            let clone = _.cloneDeep(this.foreignKeysData)
            let self = _.cloneDeep(clone[idx])
            let target = _.cloneDeep(clone[idx + 1])
            clone[idx] = target
            clone[idx + 1] = self
            this.foreignKeysData = clone
            this.$emit('update',this.foreignKeysData)
        },
        // 保存表单
        save(idx) {
            if (this.currentSelfColumn === undefined || this.currentTargetTable === undefined || this.currentTargetColumn === undefined) return
            // 检查冲突
            let rest = [], count = 0
            // 新增的外键，不可以有重复
            if (this.foreignKeysData[idx].selfColumn === undefined) {
                rest = this.foreignKeysData
                let seq = _.findIndex(rest, {selfColumn: this.currentSelfColumn})
                if (seq >= 0) {
                    this.$error({
                        title: '有重复',
                        content: '外键已经存在，请仔细检查！',
                    })
                    return
                }
            }
            // 原有外键修改，可以有重复
            this.foreignKeysData[idx] = {
                selfColumn: this.currentSelfColumn,
                targetTable: this.currentTargetTable,
                targetColumn: this.currentTargetColumn
            }
            this.currentForeignKeyIndex = undefined
            this.currentSelfColumn = undefined
            this.currentTargetTable = undefined
            this.currentTargetColumn = undefined
            this.$emit('update',this.foreignKeysData)
        },
        checkColumn(name) {
            // 当前未选中（意味着新建）
            if (this.currentSelfColumn === undefined) {
                // 排除已有
                if (_.findIndex(this.foreignKeysData, { selfColumn: name }) >= 0) return true
                return false
            }
            // 编辑状态可任意选
            else return false
        },
        // 组件方法
        // 可用状态
        setDisabled(bool) {
            this.disabled = bool
        },
        // 设定数据
        setData(data) {
            this.foreignKeysData = _.cloneDeep(data)
        },
        // 清空
        empty() {
            this.disabled = true
            this.currentForeignKeyIndex = undefined
            this.foreignKeysData = []
        }
    },
};
</script>
<style>
.ant-card-small > .ant-card-body {
    padding: 0;
}
</style>