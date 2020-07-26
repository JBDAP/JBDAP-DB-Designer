/**
 * store 的根对象
 */

export const state = () => ({
    // 全部数据
    projects: [],
    // 菜单列表
    menuList: [],
    // 当前项目
    currentProject: null,
    // 当前 schema
    currentSchema: null,
    // 当前菜单项
    currentMenuItem: [],
})

export const mutations = {
    setProjects (state,value) {
        state.projects = value
    },
    setMenuList (state,value) {
        state.menuList = value
    },
    async setCurrentProject (state,value) {
        state.currentProject = value
        // let res = await this.$http.post('/data/project/update',{
        //     name: this.currentMenuItem[0],
        //     newParts: {
        //         tables: tables
        //     }
        // })
    
    },
    setCurrentSchema (state,value) {
        state.currentSchema = value
    },
    setCurrentMenuItem (state,value) {
        state.currentMenuItem = value
    },
}

import http from '~/lib/http.js'
export const actions = {
    // 页面 store 初始化
    // nuxtServerInit 每一次 ssr 时会执行，即浏览器刷新会执行，客户端路由更新不会执行
    async nuxtServerInit ({ commit }, context) {
        console.log('nuxtServerInit', process.server ? 'server' : 'client', context.route.fullPath)
        // 读取数据写入 $store
        let res = await http.get('/data/project/all')
        // console.log(res)
        if (res.OK) {
            let projects = res.data
            commit('setProjects',projects)
            let menuList = []
            _.each(projects, (item) => {
                let obj = {}
                obj.name = item.name
                obj.tables = []
                menuList.push(obj)
            })
            commit('setMenuList',menuList)
        }
    }
}