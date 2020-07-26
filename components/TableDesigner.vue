<template>
  <a-tabs id="tableDesigner" type="card" :activeKey="activeTab" @change="callback" size="small" :tabBarGutter="8">
    <a-tab-pane key="fields" tab="字段">
        <FieldsDesigner 
            ref="fieldsEditor"
            :data="[]"
            @update="fieldsUpdate"
            style="max-width: 1000px;"
        />
    </a-tab-pane>
    <a-tab-pane key="uniques" tab="唯一键">
        <IndexesDesigner 
            ref="uniquesEditor"
            keyType="唯一"
            :data="[]"
            @update="uniquesUpdate"
            style="max-width: 600px;"
        />
    </a-tab-pane>
    <a-tab-pane key="indexes" tab="索引">
        <IndexesDesigner 
            ref="indexesEditor"
            keyType="索引"
            :data="[]"
            @update="indexesUpdate"
            style="max-width: 600px;"
        />
    </a-tab-pane>
    <a-tab-pane key="foreignKeys" tab="外键">
        <ForeignKeysDesigner 
            ref="foreignKeysEditor"
            :data="[]"
            @update="foreignKeysUpdate"
            style="max-width: 600px;"
        />
    </a-tab-pane>
    <a-tab-pane key="json" tab="JSON">
        <div style="padding: 15px 20px;">
            <a-textarea v-model="modelJson" :disabled="disabled" placeholder="生成的 model 文件内容" auto-size style="max-width:500px;max-height:405px;" />
            <div style="margin-top: 10px;">
                <a-tooltip v-model="showSuccess" placement="right" trigger="hover">
                    <template slot="title">
                        <span>{{clipboardStr}}</span>
                    </template>
                    <a-button @click="doCopy" :disabled="disabled" size="default" type="primary" icon="copy">拷贝代码</a-button>
                </a-tooltip>
            </div>
        </div>
    </a-tab-pane>
  </a-tabs>
</template>
<script>
export default {
    props: [
        'data'
    ],
    data() {
        return {
            isEmpty: true,
            tableSchema: _.cloneDeep(this.data),
            disabled: true,
            activeTab: 'fields',
            modelJson: '',
            showSuccess: false,
            clipboardStr: '点击拷贝',
        }
    },
    computed: {
    },
    watch: {
        tableSchema(nv,ov) {
            this.makeJson()
        }
    },
    methods: {
        // 生成 json
        makeJson() {
            let clone = _.cloneDeep(this.tableSchema)
            if (_.isUndefined(clone.columns)) clone.columns = []
            if (_.isUndefined(clone.uniques)) clone.uniques = []
            if (_.isUndefined(clone.indexes)) clone.indexes = []
            if (_.isUndefined(clone.foreignKeys)) clone.foreignKeys = []
            this.modelJson = JSON.stringify(clone,null,4)
        },
        // 字段有更新
        fieldsUpdate(fields,type,oldName,newName) {
            this.tableSchema.columns = fields
            if (type === 'rename') {
                // 同步修改唯一键、索引键字段名、外键字段名
                // 唯一键
                let targets = this.tableSchema.uniques
                for (let i=0; i<targets.length; i++) {
                    for (let j=0; j<targets[i].length; j++) {
                        if (targets[i][j] === oldName) targets[i][j] = newName
                    }
                }
                // 索引键
                targets = this.tableSchema.indexes
                for (let i=0; i<targets.length; i++) {
                    for (let j=0; j<targets[i].length; j++) {
                        if (targets[i][j] === oldName) targets[i][j] = newName
                    }
                }
                // 外键字段
                let project = _.cloneDeep(this.$store.state.currentProject)
                let tables = project.tables
                let seq = -1
                for (let i=0; i<tables.length; i++) {
                    let t = tables[i]
                    // 本表则获取索引
                    if (t.name === this.tableSchema.name) seq = i
                    // 其他表检查外键
                    for (let j=0; j<t.foreignKeys.length; j++) {
                        let fk = t.foreignKeys[j]
                        if (fk.targetTable === this.tableSchema.name && fk.targetColumn === oldName) fk.targetColumn = newName
                    }
                }
                // 把当前 columns 更新给 tables
                tables[seq].columns = _.cloneDeep(this.tableSchema.columns)
                // 把 tables 里面最新的 foreignKeys 更新给当前 columns
                this.tableSchema.foreignKeys = tables[seq].foreignKeys
                // 全量更新
                this.$emit('upgrade', project, this.tableSchema)
                this.makeJson()
            }
            else if (type === 'delete') {
                // 同步删除唯一键、索引键字段名、外键字段名
                // 唯一键
                this.tableSchema.uniques = _.cloneDeep(_.reject(this.tableSchema.uniques, (item) => {
                    return item.indexOf(oldName) >= 0
                }))
                // 索引键
                this.tableSchema.indexes = _.cloneDeep(_.reject(this.tableSchema.indexes, (item) => {
                    return item.indexOf(oldName) >= 0
                }))
                // 外键字段
                let project = _.cloneDeep(this.$store.state.currentProject)
                let tables = project.tables
                let seq = -1
                for (let i=0; i<tables.length; i++) {
                    let t = tables[i]
                    // 本表则获取索引
                    if (t.name === this.tableSchema.name) seq = i
                    t.foreignKeys = _.cloneDeep(_.reject(t.foreignKeys, (item)=>{
                        return item.targetTable === this.tableSchema.name && item.targetColumn === oldName
                    }))
                }
                // 把当前 columns 更新给 tables
                tables[seq].columns = _.cloneDeep(this.tableSchema.columns)
                // 把 tables 里面最新的 foreignKeys 更新给当前 columns
                this.tableSchema.foreignKeys = tables[seq].foreignKeys
                // 全量更新
                this.$emit('upgrade', project, this.tableSchema)
                this.makeJson()
            }
            else {
                this.$emit('update', this.tableSchema)
                this.makeJson()
            }
        },
        // 唯一键有更新
        uniquesUpdate(uniques) {
            this.tableSchema.uniques = uniques
            this.$emit('update', this.tableSchema)
            this.makeJson()
        },
        // 索引有更新
        indexesUpdate(indexes) {
            this.tableSchema.indexes = indexes
            this.$emit('update', this.tableSchema)
            this.makeJson()
        },
        // 外键有更新
        foreignKeysUpdate(foreignKeys) {
            this.tableSchema.foreignKeys = foreignKeys
            this.$emit('update', this.tableSchema)
            this.makeJson()
        },
        // tab 切换
        callback(key) {
            this.activeTab = key
            if (key === 'fields' && !this.isEmpty) {
                this.$nextTick(()=>{
                    this.$refs.fieldsEditor.setDisabled(this.disabled)
                    this.$refs.fieldsEditor.setData(this.tableSchema.columns)
                })
            }
            if (key === 'uniques' && !this.isEmpty) {
                this.$nextTick(()=>{
                    this.$refs.uniquesEditor.setDisabled(this.disabled)
                    this.$refs.uniquesEditor.setData(this.tableSchema.uniques)
                })
            }
            if (key === 'indexes' && !this.isEmpty) {
                this.$nextTick(()=>{
                    this.$refs.indexesEditor.setDisabled(this.disabled)
                    this.$refs.indexesEditor.setData(this.tableSchema.indexes)
                })
            }
            if (key === 'foreignKeys' && !this.isEmpty) {
                this.$nextTick(()=>{
                    this.$refs.foreignKeysEditor.setDisabled(this.disabled)
                    this.$refs.foreignKeysEditor.setData(this.tableSchema.foreignKeys)
                })
            }
            if (key === 'json' && !this.isEmpty) {
                this.$nextTick(()=>{
                    this.makeJson()
                })
            }
        },
        // 拷贝代码
        async doCopy () {
            try {
                this.$copyText(this.modelJson)
                this.clipboardStr = '拷贝成功 !'
                console.log('yes')
                setTimeout(() => {
                    this.showSuccess = false
                    setTimeout(() => {
                        this.clipboardStr = '点击拷贝'
                    }, 500);
                }, 2000);
            }
            catch(err) {
                console.log(err)
            }
        },
        // 组件方法
        // 可用状态
        setDisabled(bool) {
            this.disabled = bool
            if (this.$refs.fieldsEditor) this.$refs.fieldsEditor.setDisabled(bool)
            if (this.$refs.uniquesEditor) this.$refs.uniquesEditor.setDisabled(bool)
            if (this.$refs.indexesEditor) this.$refs.indexesEditor.setDisabled(bool)
            if (this.$refs.foreignKeysEditor) this.$refs.foreignKeysEditor.setDisabled(bool)
        },
        // 设定数据
        setData(data) {
            this.tableSchema = _.cloneDeep(data)
            if (this.$refs.fieldsEditor) this.$refs.fieldsEditor.setData(this.tableSchema.columns)
            if (this.$refs.uniquesEditor) this.$refs.uniquesEditor.setData(this.tableSchema.uniques)
            if (this.$refs.indexesEditor) this.$refs.indexesEditor.setData(this.tableSchema.indexes)
            if (this.$refs.foreignKeysEditor) this.$refs.foreignKeysEditor.setData(this.tableSchema.foreignKeys)
            this.isEmpty = false
        },
        // 清空数据
        empty() {
            // 清空字段编辑器
            if (this.$refs.fieldsEditor) this.$refs.fieldsEditor.empty()
            if (this.$refs.uniquesEditor) this.$refs.uniquesEditor.empty()
            if (this.$refs.indexesEditor) this.$refs.indexesEditor.empty()
            if (this.$refs.foreignKeysEditor) this.$refs.foreignKeysEditor.empty()
            // 清空生成的 json
            this.modelJson = ''
            this.isEmpty = true
        }
    },
};
</script>
<style>
.ant-tabs-nav-wrap {
    padding-left: 20px;
    background-color: #edf0f3;
}
.ant-tabs-tabpane {
    padding: 0;
}
</style>