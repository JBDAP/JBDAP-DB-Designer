<template>
    <div id="fieldsDesigner" style="padding: 15px 20px;">
        <a-row :gutter="15">
            <a-col :span="18" style="position:relative;">
                <a-table :columns="fieldsColumns" :data-source="fieldsData" rowKey="name" size="small" :scroll="{ y: 360 }" :pagination="false">
                    <template slot="title" slot-scope="currentPageData">
                        <a-button @click="addField" :disabled="disabled" size="small" type="link" icon="plus">新建字段</a-button>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;快捷添加：&nbsp;&nbsp;</span>
                        <a-checkbox :disabled="disabled || hasPrimary" v-model="autoId">
                            自增主键[INT]
                        </a-checkbox>
                        <a-checkbox :disabled="disabled || hasTimestamp" v-model="autoTimestamp">
                            时间戳
                        </a-checkbox>
                    </template>
                    <template slot="showType" slot-scope="type, record">
                        {{ typeDes(record) }}
                        <span v-if="record.unsigned === true" style="color:#ccc;">unsigned</span>
                    </template>
                    <span slot="isPrimary" slot-scope="primary">
                        <a-icon v-if="primary !== undefined && primary === true" type="check-square" />
                    </span>
                    <span slot="isNotNullable" slot-scope="notNullable">
                        <a-icon v-if="notNullable !== undefined && notNullable === true" type="check-square" />
                    </span>
                    <span slot="actions" slot-scope="text, record">
                        <a @click="fillForm(record)"><a-icon type="edit" /></a>
                        <a @click="moveUp(record)"><a-icon type="arrow-up" /></a>
                        <a @click="moveDown(record)"><a-icon type="arrow-down" /></a>
                        <a @click="removeField(record)"><a-icon type="delete" /></a>
                    </span>
                </a-table>
            </a-col>
            <a-col v-if="showEditor" :span="6">
                <a-card size="small" :title="editorTitle">
                    <a-button slot="extra" @click="resetForm" size="small" type="link" icon="reload">重置</a-button>
                    <!-- 字段编辑 -->
                    <div style="padding: 10px 12px;">
                        <div style="margin-bottom: 10px;">
                            <a-checkbox v-model="currentPrimary" :disabled="disablePrimary()">
                                数据表主键
                            </a-checkbox>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <a-input ref="currentName" v-model="currentName" placeholder="字段名 - 必填" style="width:100%;" />
                        </div>
                        <div style="margin-bottom: 10px;">
                            <a-input v-model="currentComment" placeholder="备注" style="width:100%;" />
                        </div>
                        <div style="margin-bottom: 10px;">
                            <a-select ref="typeSelect" v-model="currentType" allowClear placeholder="字段类型 - 必填" style="width:100%">
                                <a-select-option value="increments">自增主键</a-select-option>
                                <a-select-option value="bigIncrements">自增主键[BIG]</a-select-option>
                                <a-select-option value="integer">整数</a-select-option>
                                <a-select-option value="bigInteger">大整数</a-select-option>
                                <a-select-option value="string">字符串</a-select-option>
                                <a-select-option value="text">大字符串</a-select-option>
                                <a-select-option value="float">浮点数</a-select-option>
                                <a-select-option value="decimal">小数</a-select-option>
                                <a-select-option value="boolean">布尔值</a-select-option>
                                <a-select-option value="datetime">日期时间</a-select-option>
                                <a-select-option value="enum">枚举</a-select-option>
                                <a-select-option value="binary">二进制</a-select-option>
                            </a-select>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <a-checkbox v-model="currentNotNullable" :disabled="['increments','bigIncrements'].indexOf(currentType) >= 0 || ['createdAt','updatedAt'].indexOf(currentName) >= 0">
                                不可以为空
                            </a-checkbox>
                        </div>
                        <div v-if="['increments','bigIncrements','integer','bigInteger','float','decimal'].indexOf(currentType) >= 0" style="margin-bottom: 10px;">
                            <a-checkbox v-model="currentUnsigned" :disabled="['increments','bigIncrements'].indexOf(currentType) >= 0">
                                无正负号
                            </a-checkbox>
                        </div>
                        <div v-if="['integer','bigInteger','string','binary'].indexOf(currentType) >= 0" style="margin-bottom: 10px;">
                            <a-input v-model="currentLength" placeholder="长度" style="width:100%;" />
                        </div>
                        <template v-if="['float','decimal'].indexOf(currentType) >= 0">
                            <div style="margin-bottom: 10px;">
                                <a-input v-model="currentPrecision" placeholder="精度位数" style="width:100%;" />
                            </div>
                            <div style="margin-bottom: 10px;">
                                <a-input v-model="currentScale" placeholder="小数位数" style="width:100%;" />
                            </div>
                        </template>
                        <div  v-if="['increments','bigIncrements','binary'].indexOf(currentType) < 0" style="margin-bottom: 10px;">
                            <a-input v-model="currentDefaultTo" placeholder="默认值" style="width:100%;" />
                        </div>
                        <div v-if="currentType === 'enum'" style="margin-bottom: 10px;">
                            <a-select v-model="currentEnumValues" mode="tags" style="width: 100%" placeholder="枚举值">
                                <a-select-option v-for="i in []" :key="i">{{ i }}</a-select-option>
                            </a-select>
                        </div>
                        <a-button @click="saveFieldForm" type="primary" icon="check">保存</a-button>
                    </div>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>
<script>
export default {
    props: [
        'data'
    ],
    data() {
        return {
            disabled: true,
            showEditor: false,
            editorTitle: '新增字段',
            autoId: false,
            autoTimestamp: false,
            currentFieldIndex: undefined,
            currentPrimary: undefined,
            currentName: undefined,
            currentComment: undefined,
            currentNotNullable: undefined,
            currentType: undefined,
            currentUnsigned: undefined,
            currentLength: undefined,
            currentPrecision: undefined,
            currentScale: undefined,
            currentDefaultTo: undefined,
            currentEnumValues: [],
            fieldsColumns: [
                {
                    title: '字段名',
                    key: 'name',
                    dataIndex: 'name',
                },
                {
                    title: '类型',
                    dataIndex: 'type',
                    scopedSlots: { customRender: 'showType' },
                },
                {
                    title: '主键',
                    dataIndex: 'primary',
                    width: '50px',
                    align: 'center',
                    scopedSlots: { customRender: 'isPrimary' },
                },
                {
                    title: '不为空',
                    dataIndex: 'notNullable',
                    width: '65px',
                    align: 'center',
                    scopedSlots: { customRender: 'isNotNullable' },
                },
                {
                    title: '默认值',
                    dataIndex: 'defaultTo',
                    width: '80px',
                },
                {
                    title: '管理',
                    dataIndex: '',
                    width: '90px',
                    align: 'center',
                    scopedSlots: { customRender: 'actions' },
                },
            ],
            fieldsData: _.cloneDeep(this.data),
        }
    },
    computed: {
        hasPrimary() {
            let res = _.findIndex(this.fieldsData, { primary: true }) >= 0 || _.findIndex(this.fieldsData, { name: 'id' }) >= 0
            if (!res) this.autoId = false
            return res
        },
        hasTimestamp() {
            let res = _.findIndex(this.fieldsData, { name: 'createdAt' }) >= 0 && _.findIndex(this.fieldsData, { name: 'updatedAt' }) >= 0
            if (!res) this.autoTimestamp = false
            return res
        }
    },
    watch: {
        autoId(nv,ov) {
            if (nv === true) {
                if (_.findIndex(this.fieldsData, { primary: true }) >= 0 || _.findIndex(this.fieldsData, { name: 'id' }) >= 0) {
                    this.$error({
                        title: '字段冲突',
                        content: '插入失败，主键或者名为 [id] 的字段已经存在！',
                        onOk: async () => {
                            this.$nextTick(()=>{
                                this.autoId = false
                            })
                        }
                    })
                    return
                }
                // 插入最前
                let entry = {
                    name: 'id',
                    primary: true,
                    comment: '自增主键',
                    type: 'increments',
                    notNullable: true,
                    unsigned: true,
                }
                this.fieldsData = _.concat([entry],this.fieldsData)
                this.$emit('update',this.fieldsData)
            }
        },
        autoTimestamp(nv,ov) {
            if (nv === true) {
                if (_.findIndex(this.fieldsData, { name: 'createdAt' }) >= 0 && _.findIndex(this.fieldsData, { name: 'updatedAt' }) >= 0) {
                    this.$error({
                        title: '字段冲突',
                        content: '插入失败，时间戳字段 [createdAt] 和 [updatedAt] 已经存在！',
                        onOk: async () => {
                            this.$nextTick(()=>{
                                this.autoTimestamp = false
                            })
                        }
                    })
                    return
                }
                // 插入最后
                if (_.findIndex(this.fieldsData, { name: 'createdAt' }) >= 0) this.fieldsData = _.reject(this.fieldsData, { name: 'createdAt' })
                if (_.findIndex(this.fieldsData, { name: 'updatedAt' }) >= 0) this.fieldsData = _.reject(this.fieldsData, { name: 'updatedAt' })
                let entry = {
                    name: 'createdAt',
                    comment: '创建时间',
                    type: 'datetime',
                    notNullable: true,
                }
                let cat = _.clone(entry)
                entry.name = 'updatedAt'
                entry.comment = '更新时间'
                let uat = _.clone(entry)
                this.fieldsData = _.concat(this.fieldsData,[cat,uat])
                this.$emit('update',this.fieldsData)
            }
        },
        currentType(nv,ov) {
            if (nv === 'increments' || nv === 'bigIncrements') {
                this.currentNotNullable = true
                this.currentUnsigned = true
            }
            if (['increments','bigIncrements','integer','bigInteger','float','decimal'].indexOf(nv) < 0) {
                this.currentUnsigned = undefined
            }
            if (nv !== 'enum') this.currentEnumValues = undefined
            if ((nv === 'string' || nv === 'text') && this.currentDefaultTo === '') this.currentDefaultTo = undefined
        }
    },
    methods: {
        // 表格中的类型描述
        typeDes(row) {
            if (row.type === 'string') {
                if (row.length) return `${row.type}(${row.length})`
                else return `${row.type}(255)`
            }
            if (row.type === 'integer' || row.type === 'bigInteger') {
                let str = `${row.type}`
                if (row.length) str = `${row.type}(${row.length})`
                return str
            }
            if (row.type === 'float' || row.type === 'decimal') {
                let str = `${row.type}`
                if (row.precision && row.scale) str = `${row.type}(${row.precision},${row.scale})`
                return str
            }
            if (row.type === 'binary') {
                if (row.length) return `${row.type}(${row.length})`
                else return `${row.type}`
            }
            return row.type
        },
        // 新增字段
        addField() {
            this.showEditor = true
            this.editorTitle = '新增字段'
            this.resetForm()
            this.$nextTick(()=>{
                this.$refs.currentName.focus()
            })
        },
        // 是否禁用主键选项
        disablePrimary() {
            if (this.editorTitle === '新增字段') return _.findIndex(this.fieldsData,{ primary: true }) >= 0
            else {
                if (this.fieldsData[this.currentFieldIndex].primary === true) return false
                else return _.findIndex(this.fieldsData,{ primary: true }) >= 0
            }
        },
        // 编辑字段
        fillForm(record) {
            record = _.cloneDeep(record)
            if (this.fieldsData.length === 0) return
            this.currentFieldIndex = _.findIndex(this.fieldsData, {name: record.name})
            if (!this.showEditor) this.showEditor = true
            this.$nextTick(()=>{
                this.editorTitle = '编辑字段'
                this.currentPrimary = record.primary
                this.currentName = record.name
                this.currentComment = record.comment
                this.currentNotNullable = record.notNullable
                this.currentType = record.type
                this.currentUnsigned = record.unsigned
                this.currentLength = record.length
                this.currentPrecision = record.precision
                this.currentScale = record.scale
                this.currentDefaultTo = record.defaultTo
                this.currentEnumValues = record.values
            })
        },
        // 重置表单
        resetForm() {
            if (this.editorTitle === '新增字段') {
                this.currentFieldIndex = undefined
                this.currentPrimary = undefined
                this.currentName = undefined
                this.currentComment = undefined
                this.currentNotNullable = undefined
                this.currentType = undefined
                this.currentUnsigned = undefined
                this.currentLength = undefined
                this.currentPrecision = undefined
                this.currentScale = undefined
                this.currentDefaultTo = undefined
                this.currentEnumValues = undefined
            }
            else {
                if (this.fieldsData.length > 0 && this.currentFieldIndex) this.fillForm(this.fieldsData[this.currentFieldIndex])
            }
        },
        // 删除字段
        removeField(record) {
            this.fieldsData = _.reject(this.fieldsData, { name: record.name })
            this.$emit('update',this.fieldsData,'delete',record.name)
        },
        // 向上移动
        moveUp(record) {
            this.currentFieldIndex = _.findIndex(this.fieldsData, {name: record.name})
            if (this.currentFieldIndex - 1 < 0) return
            let clone = _.cloneDeep(this.fieldsData)
            let self = _.cloneDeep(clone[this.currentFieldIndex])
            let target = _.cloneDeep(clone[this.currentFieldIndex - 1])
            clone[this.currentFieldIndex] = target
            clone[this.currentFieldIndex - 1] = self
            this.fieldsData = clone
            this.$emit('update',this.fieldsData)
        },
        // 向下移动
        moveDown(record) {
            this.currentFieldIndex = _.findIndex(this.fieldsData, {name: record.name})
            if (this.currentFieldIndex + 1 > this.fieldsData.length - 1) return
            let clone = _.cloneDeep(this.fieldsData)
            let self = _.cloneDeep(clone[this.currentFieldIndex])
            let target = _.cloneDeep(clone[this.currentFieldIndex + 1])
            clone[this.currentFieldIndex] = target
            clone[this.currentFieldIndex + 1] = self
            this.fieldsData = clone
            this.$emit('update',this.fieldsData)
        },
        // 保存表单
        async saveFieldForm() {
            let entry = {}
            if (this.currentPrimary !== undefined) entry.primary = this.currentPrimary
            if (this.currentName !== undefined) entry.name = this.currentName
            if (this.currentComment !== undefined) entry.comment = this.currentComment
            if (this.currentType !== undefined) entry.type = this.currentType
            if (this.currentNotNullable !== undefined) entry.notNullable = this.currentNotNullable
            if (this.currentUnsigned !== undefined) entry.unsigned = this.currentUnsigned
            if (this.currentLength !== undefined) entry.length = parseInt(this.currentLength)
            if (this.currentPrecision !== undefined) entry.precision = parseInt(this.currentPrecision)
            if (this.currentScale !== undefined) entry.scale = parseInt(this.currentScale)
            if (this.currentDefaultTo !== undefined) {
                if (this.currentType === 'integer') entry.defaultTo = parseInt(this.currentDefaultTo)
                else if (this.currentType === 'float') entry.defaultTo = parseFloat(this.currentDefaultTo)
                else entry.defaultTo = this.currentDefaultTo
            }
            if (this.currentEnumValues !== undefined) entry.values = this.currentEnumValues
            // 新增
            if (this.editorTitle === '新增字段') {
                this.currentFieldIndex = undefined
                // 必备字段检查
                if (this.currentName === undefined || this.currentType === undefined) {
                    this.$error({
                        title: '内容缺失',
                        content: '字段 [名称] 和 [类型] 是必填内容！',
                        onOk: async () => {
                            this.$nextTick(()=>{
                                if (this.currentName === undefined) this.$refs.currentName.focus()
                                if (this.currentType === undefined) this.$refs.typeSelect.focus()
                            })
                        }
                    })
                    return
                }
                // 检查冲突
                if (_.findIndex(this.fieldsData, {name: entry.name}) >= 0) {
                    this.$error({
                        title: '名称冲突',
                        content: '字段 [' + entry.name + '] 已经存在，请更改！',
                        onOk: async () => {
                            this.$nextTick(()=>{
                                this.$refs.currentName.focus()
                            })
                        }
                    })
                    return
                }
                let tails = _.remove(_.cloneDeep(this.fieldsData), (item) => { return item.name === 'createdAt' || item.name === 'updatedAt' }).length
                this.fieldsData.splice(this.fieldsData.length - tails,0,entry)
                this.resetForm()
                this.$emit('update',this.fieldsData)
            }
            // 修改
            else {
                // 检查冲突
                let oldName = this.fieldsData[this.currentFieldIndex].name
                if (entry.name !== oldName) {
                    // 改名了
                    if (_.findIndex(this.fieldsData, {name: entry.name}) >= 0) {
                        this.$error({
                            title: '名称冲突',
                            content: '字段 [' + entry.name + '] 已经存在，请更改！',
                            onOk: async () => {
                                this.$nextTick(()=>{
                                    this.$refs.currentName.focus()
                                })
                            }
                        })
                        return
                    }
                    let clone = _.cloneDeep(this.fieldsData)
                    clone[this.currentFieldIndex] = entry
                    this.fieldsData = clone
                    this.$emit('update',this.fieldsData,'rename',oldName,entry.name)
                }
                else {
                    // 没改名
                    let clone = _.cloneDeep(this.fieldsData)
                    clone[this.currentFieldIndex] = entry
                    this.fieldsData = clone
                    this.$emit('update',this.fieldsData)
                }
            }
            this.$nextTick(()=>{
                this.$refs.currentName.focus()
            })
        },
        // 组件方法
        // 可用状态
        setDisabled(bool) {
            this.disabled = bool
        },
        // 设定数据
        setData(data) {
            this.fieldsData = _.cloneDeep(data)
            this.currentFieldIndex = undefined
            this.resetForm()
            this.showEditor = false
        },
        // 清空
        empty() {
            this.disabled = true
            this.showEditor = false
            this.fieldsData = []
            this.currentFieldIndex = undefined
        }
    },
};
</script>
<style>
</style>