<template>
  <div v-if="readyToShow" class="container">
    <a-layout id="page">
      <!-- 左边栏 -->
      <a-layout-sider>
        <div style="padding: 15px; border-bottom: solid 1px #212732;">
          <div style="background-color: #212732; text-align: center; font-size: 16px; color: #fff; font-weight: 400; line-height: 39px;">
            数据库设计器
          </div>
        </div>
        <!-- 新建按钮 -->
        <div style="padding: 16px 0 10px 0; text-align: center;">
          <a-button @click="createProject" type="dashed" icon="plus" ghost>新建项目</a-button>
        </div>
        <!-- 新建项目 -->
        <div v-if="showNewProject" style="padding: 0 20px 10px 20px; text-align: center;">
          <a-input-search ref="projectName" v-model="projectName" placeholder="项目名称" enter-button="确认" size="small" @search="doCreateProject" style="width:120px;" />
          <a-button @click="showNewProject = false" type="default" size="small" shape="circle" icon="close" ghost></a-button>
        </div>
        <!-- 项目列表 -->
        <a-menu :selectedKeys="currentMenuItem" theme="dark" :style="{ width: '100%' }">
            <a-menu-item v-for="(item,index) in menuList" @click="menuItemClick(item)" :key="item.name">
              <a-icon type="database" />
              {{ item.name }} 
            </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <!-- 工作区 -->
      <a-layout-content id="workArea" style="background-color: #fff; height: 100vh;">
        <!-- 提示信息 -->
        <div v-if="menuList.length === 0 || currentMenuItem.length === 0" style="padding: 20px; padding-top: 15px;">
          <a-alert
            v-if="menuList.length === 0"
            message="目前还没有项目，请点击左侧按钮创建"
            type="warning"
            closable
          />
          <a-alert
            v-else-if="currentMenuItem.length === 0"
            message="请从左侧列表选中一个项目开始工作"
            type="warning"
            closable
          />
        </div>
        <template v-else>
          <!-- 项目概况 -->
          <div style="background-color: #edf0f3; border-bottom: solid 1px #ccc;">
            <a-row style="margin:0 20px; padding: 19px 0 15px 0; height: 69px; background-color: #edf0f3;">
              <a-col :span="12">
                <span style="color: #999; font-size: 16px; font-weight: 400; line-height: 32px;">项目名称：</span>
                <!-- 重命名 -->
                <template v-if="!showRenameProject">
                  <span style="font-size: 18px; font-weight: 600; line-height: 32px;">{{ currentMenuItem[0] }}</span>
                  <a-button @click="renameProject" type="link" icon="edit"></a-button>
                </template>
                <template v-else>
                  <a-input-search ref="renameProject" v-model="newProjectName" placeholder="新项目名称" style="width:200px;" enter-button="确认" size="default" @search="doRenameProject" />
                  <a-button @click="showRenameProject = false" type="primary" size="small" shape="circle" icon="close" ghost></a-button>
                </template>
              </a-col>
              <!-- 项目管理 -->
              <a-col :span="12" style="text-align: right;">
                <a id="downloadLink" :href="'/api/data/download/'+currentProject.name" target="_blank" style="visibility:hidden;"></a>
                <a-dropdown>
                  <a-menu slot="overlay" @click="resultHandler">
                    <a-menu-item key="copy"> <a-icon type="copy" />拷贝完整代码</a-menu-item>
                    <a-menu-item key="download"> <a-icon type="download" />下载 js 文件</a-menu-item>
                  </a-menu>
                  <a-button type="primary" style="margin-left: 8px">项目成果 <a-icon type="down" /></a-button>
                </a-dropdown>
                <a-button @click="delProject" type="danger" icon="trash">删除项目</a-button>
              </a-col>
            </a-row>
          </div>
          <!-- 数据表下拉框 -->
          <div style="padding: 15px 20px; width: 100%; height: 62px; background-color: #edf0f3;">
            <div style="display:block;float:left;margin-right:6px;">
              <a-select ref="tablesSelect" v-model="currentTableName" allowClear placeholder="请选择数据表" style="width: 160px">
                <a-select-option v-for="(item,index) in tables" :value="item" :key="index">
                  {{ item }}
                </a-select-option>
              </a-select>
              <a-button v-if="!showEditTable" @click="createTable" type="default" shape="circle" icon="plus"></a-button>
              <a-button v-if="(currentTableName || showEditTable) && !showNewTable" @click="editTable" type="primary" shape="circle" icon="edit"></a-button>
              <a-button v-if="currentTableName && !showEditTable && !showNewTable" @click="deleteTable" type="danger" shape="circle" icon="delete"></a-button>
            </div>
            <!-- 创建或者数据表 -->
            <template v-if="showNewTable || showEditTable">
              <div style="display:block;float:left;margin-right:6px;">
                <a-input ref="tableName" v-model="tableName" placeholder="数据表名" style="width:120px;" />
                <a-input v-model="tableVersion" placeholder="版本号" style="width:80px;" />
                <a-input v-model="tableComment" placeholder="备注"  style="width:188px;"/>
              </div>
              <div style="display:block;float:left;margin-top:-0.5px;">
                <a-button v-if="showNewTable" @click="doCreateTable" type="primary">提交</a-button>
                <a-button v-if="showEditTable" @click="doEditTable" type="primary">提交</a-button>
                <a-button @click="tableName='';tableVersion='';tableComment='';showNewTable=false;showEditTable=false" type="default">放弃</a-button>
              </div>
            </template>
          </div>
          <!-- 数据表编辑器 -->
          <div style="width: 100%;">
            <TableDesigner ref="tableDesigner" :data="currentSchema" @update="updateSchema" @upgrade="updateProject"></TableDesigner>
          </div>
        </template>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  data() {
    return {
      readyToShow: false,
      projectName: undefined,
      newProjectName: undefined,
      showNewProject: false,
      showRenameProject: false,
      showNewTable: false,
      showEditTable: false,
      tableName: '',
      tableVersion: '',
      tableComment: '',
      currentTableName: undefined,
    }
  },
  mounted() {
    // 显示界面
    this.readyToShow = true
    this.$nextTick(() => {
      // 修补 antdv 的下拉菜单滚动时滑走的 bug，这里选择让它隐藏
      if (process.client) {
          document.getElementById('workArea').addEventListener('scroll', ()=>{
            let drops = document.getElementsByClassName('ant-select-dropdown')
            _.each(drops, (item) => {
                item.style.display = 'none'
            })
            this.$refs.tablesSelect.blur()
          })
      }
    })
  },
  computed: {
    ...mapState([
        'projects',
        'menuList',
        'currentProject',
        'currentSchema',
        'currentMenuItem',
    ]),
    tables() {
      return _.map(this.currentProject.tables,'name').sort()
    }
  },
  watch: {
    currentTableName(nv,ov) {
      // 隐藏新建table表单
      this.showNewTable = false
      // 给数据表编辑组件绑定数据源
      if (nv !== undefined) {
        let schema = _.cloneDeep(_.find(this.currentProject.tables,{name:nv}))
        this.setCurrentSchema(schema)
        this.$refs.tableDesigner.setDisabled(false)
        this.$refs.tableDesigner.setData(schema)
      }
      // 初始化界面
      else {
        this.$refs.tableDesigner.setDisabled(true)
        this.$refs.tableDesigner.empty()
      }
    }
  },
  methods: {
    ...mapMutations([
        'setProjects',
        'setMenuList',
        'setCurrentProject',
        'setCurrentSchema',
        'setCurrentMenuItem',
    ]),
    // 点击菜单
    menuItemClick(item) {
      this.setCurrentMenuItem([item.name])
      this.setCurrentProject(_.cloneDeep(_.find(this.projects,{ name: item.name })))
      this.projectName = ''
      this.currentTableName = undefined
      this.showNewProject = false
      this.showRenameProject = false
    },
    // 显示新项目文本框
    createProject() {
      this.projectName = ''
      this.showNewProject = true
      this.$nextTick(()=>{
        this.$refs.projectName.focus()
      })
    },
    // 执行新建
    async doCreateProject(name) {
      if (name.trim() === '') return
      if (_.findIndex(this.projects,{name:name.trim()}) >= 0) {
        this.$error({
          title: '名称冲突',
          content: '项目名已经存在，请更改！',
          onOk: async () => {
            this.$nextTick(()=>{
              this.$refs.projectName.focus()
            })
          }
        })
        return
      }
      // 提交到数据库
      let res = await this.$http.post('/data/project/create',{
        name: name,
        tables: []
      })
      // console.log(res)
      let clone = _.cloneDeep(this.projects)
      clone.push({
        name: name,
        tables: []
      })
      this.setProjects(clone)
      clone = _.cloneDeep(this.menuList)
      clone.push({
        name: name,
        tables: []
      })
      this.setMenuList(clone)
      this.projectName = ''
      this.showNewProject = false
    },
    // 显示重命名文本框
    renameProject() {
      this.newProjectName = this.currentMenuItem[0]
      this.showRenameProject = true
      this.$nextTick(()=>{
        this.$refs.renameProject.focus()
      })
    },
    // 执行重命名
    async doRenameProject(name) {
      if (name.trim() === '') return
      if (name.trim() === this.currentMenuItem[0]) {
        this.showRenameProject = false
        return
      }
      if (_.findIndex(this.projects,{name:name.trim()}) >= 0) {
        this.$error({
          title: '名称冲突',
          content: '项目名已经存在，请更改！',
          onOk: async () => {
            this.$nextTick(()=>{
              this.$refs.renameProject.focus()
            })
          }
        })
        return
      }
      // 提交到数据库
      let res = await this.$http.post('/data/project/update',{
        name: this.currentMenuItem[0],
        newParts: {
          name: name
        }
      })
      let clone = _.cloneDeep(this.projects)
      _.find(clone, {name:this.currentMenuItem[0]}).name = name
      this.setProjects(clone)
      clone = _.cloneDeep(this.menuList)
      _.find(clone, {name:this.currentMenuItem[0]}).name = name
      this.setMenuList(clone)
      this.setCurrentMenuItem([name])
      this.newProjectName = ''
      this.showRenameProject = false
    },
    // 删除项目
    async delProject() {
      this.$confirm({
        title: '请确认',
        content: '你真的要删除项目 [' + this.currentMenuItem[0] + '] 吗？',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          // 提交到数据库
          let name = this.currentMenuItem[0]
          let res = await this.$http.get('/data/project/delete/'+name)
          let copy = _.reject(_.cloneDeep(this.projects),{ name: name })
          this.setProjects(copy)
          copy = _.reject(_.cloneDeep(this.menuList),{ name: name })
          this.setMenuList(copy)
          this.setCurrentMenuItem([])
          this.setCurrentProject(null)
          this.showRenameProject = false
        }
      })
    },
    // 新建数据表
    createTable() {
      this.showNewTable = true
      this.tableName = ''
      this.tableVersion = ''
      this.tableComment = ''
      this.$nextTick(()=>{
        this.$refs.tableName.focus()
      })
    },
    // 执行新建表
    async doCreateTable() {
      if (this.tableName.trim() === '') {
        this.$refs.tableName.focus()
        return
      }
      if (_.findIndex(this.currentProject.tables,{ name: this.tableName.trim() }) >= 0) {
        this.$error({
          title: '名称冲突',
          content: '数据表已经存在，请更改！',
          onOk: async () => {
            this.$nextTick(()=>{
              this.$refs.tableName.focus()
            })
          }
        })
        return
      }
      // 提交到数据库
      let projects = _.cloneDeep(this.projects)
      let project = _.cloneDeep(_.find(projects, { name: this.currentMenuItem[0] }))
      let tables = project.tables
      tables.push({
        name: this.tableName,
        version: this.tableVersion,
        comment: this.tableComment,
        columns: [],
        uniques: [],
        indexes: [],
        foreignKeys: []
      })
      let res = await this.$http.post('/data/project/update',{
        name: this.currentMenuItem[0],
        newParts: {
          tables: tables
        }
      })
      let idx = _.findIndex(projects, { name: this.currentMenuItem[0] })
      projects[idx].tables = tables
      this.setProjects(projects)
      this.setCurrentProject(project)
      this.currentTableName = this.tableName
      this.tableName = ''
      this.tableVersion = ''
      this.tableComment = ''
      this.showNewTable = false
    },
    // 编辑数据表
    editTable() {
      this.showEditTable = true
      this.tableName = this.currentSchema.name
      this.tableVersion = this.currentSchema.version
      this.tableComment = this.currentSchema.comment
      this.$nextTick(()=>{
        this.$refs.tableName.focus()
      })
    },
    // 执行编辑表
    async doEditTable() {
      if (this.tableName.trim() === '') {
        this.$refs.tableName.focus()
        return
      }
      // 改名
      let isRename = false
      if (this.tableName !== this.currentTableName) {
        isRename = true
        if (_.findIndex(this.currentProject.tables,{ name: this.tableName.trim() }) >= 0) {
          this.$error({
            title: '名称冲突',
            content: '数据表已经存在，请更改！',
            onOk: async () => {
              this.$nextTick(()=>{
                this.$refs.tableName.focus()
              })
            }
          })
          return
        }
      }
      // 提交到数据库
      let projects = _.cloneDeep(this.projects)
      let project = _.cloneDeep(_.find(projects, { name: this.currentMenuItem[0] }))
      let tables = project.tables
      let seq = _.findIndex(tables, {name: this.currentTableName})
      tables[seq].name = this.tableName
      tables[seq].version = this.tableVersion
      tables[seq].comment = this.tableComment
      // 检查是否影响到其它表的外键
      if (isRename) {
        // 修改关联表的外键信息
        for (let i=0; i<tables.length; i++) {
            let t = tables[i]
            // 其他表检查外键
            for (let j=0; j<t.foreignKeys.length; j++) {
                let fk = t.foreignKeys[j]
                if (fk.targetTable === this.currentTableName) fk.targetTable = this.tableName
            }
        }
      }
      // 更新数据
      await this.updateProject(project,tables[seq])
      // 数据状态整理
      this.currentTableName = this.tableName
      this.tableName = ''
      this.tableVersion = ''
      this.tableComment = ''
      this.showEditTable = false
    },
    // 删除数据表
    async deleteTable() {
      this.$confirm({
        title: '请确认',
        content: '你真的要删除数据表 [' + this.currentTableName + '] 吗？',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          // 提交到数据库
          let name = this.currentMenuItem[0]
          let projects = _.cloneDeep(this.projects)
          let project = _.cloneDeep(_.find(projects, { name: name }))
          project.tables = _.reject(project.tables, { name: this.currentTableName })
          // 删除关联表的关联字段和外键
          for (let i=0; i<project.tables.length; i++) {
              let t = project.tables[i]
              // 先取得失效外键字段
              let fks = _.map(_.cloneDeep(_.remove(_.cloneDeep(t.foreignKeys), (item)=>{
                  return item.targetTable === this.currentTableName
              })),'selfColumn')
              // 删除失效外键
              t.foreignKeys = _.cloneDeep(_.reject(t.foreignKeys, (item)=>{
                  return item.targetTable === this.currentTableName
              }))
              // 删除关联字段
              t.columns = _.cloneDeep(_.reject(t.columns, (item)=>{
                  return fks.indexOf(item.name) >= 0
              }))
          }
          // console.log(project)
          // 更新数据
          await this.updateProject(project,null)
          this.currentTableName = undefined
        }
      })
    },
    // 更新单个数据表
    async updateSchema(schema) {
      // 提交到数据库
      let projects = _.cloneDeep(this.projects)
      let project = _.cloneDeep(_.find(projects, { name: this.currentMenuItem[0] }))
      let tables = project.tables
      let idx = _.findIndex(tables, { name: schema.name })
      if (idx >= 0) tables[idx] = _.cloneDeep(schema)
      let res = await this.$http.post('/data/project/update',{
        name: this.currentMenuItem[0],
        newParts: {
          tables: tables
        }
      })
      idx = _.findIndex(projects, { name: this.currentMenuItem[0] })
      projects[idx].tables = tables
      this.setProjects(projects)
      this.setCurrentProject(project)
      this.setCurrentSchema(_.cloneDeep(schema))
    },
    // 更新整个项目
    async updateProject(project,schema) {
      // 提交到数据库
      let projects = _.cloneDeep(this.projects)
      let res = await this.$http.post('/data/project/update',{
        name: project.name,
        newParts: project
      })
      let idx = _.findIndex(projects, { name: project.name })
      projects[idx] = _.cloneDeep(project)
      this.setProjects(projects)
      this.setCurrentProject(_.cloneDeep(project))
      this.setCurrentSchema(_.cloneDeep(schema))
    },
    // 项目成果处理
    resultHandler(e) {
      if (e.key === 'copy') {
        try {
          let final = `module.exports = ${JSON.stringify(this.currentProject.tables,null,4)}`
          this.$copyText(final)
          this.$success({
            title: '拷贝成功',
            content: '这是一个包含了所有数据表 model 的模块代码，请粘贴到你的代码编辑器里使用',
          })
        }
        catch(err) {
          console.log(err)
        }
      }
      if (e.key === 'download') this.download()
    },
    // 下载项目文件
    download() {
      document.getElementById('downloadLink').click()
    }
  }
}
</script>

<style>
html, body {
  min-width: 1000px;
}
.container, #page {
  margin: 0 auto;
  min-height: 100vh;
}
.ant-menu-dark, .ant-menu-dark .ant-menu-sub,
.ant-layout-sider-children {
  background-color: #001520;
}
.ant-menu-item {
  width: 100%;
}
.ant-layout-content .ant-layout-has-sider .ant-layout-sider-dark,
.ant-layout-content .ant-layout-has-sider .ant-layout-sider,
.ant-layout-content .ant-layout-has-sider .ant-layout-sider-children {
  background-color: transparent;
}
.ant-divider-inner-text {
  color: #999;
  font-weight: 300;
}
.ant-tabs-bar {
  margin-bottom: 0;
}
</style>
