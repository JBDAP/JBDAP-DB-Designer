/**
 * 这个插件是对基础开发环境的增强
 * 只作用于 client 端
 */

// 应用 ant-design-vue 库
import Vue from 'vue'

// 给 Vue 实例挂载 cookie 操作工具
// 注意对 cookie 的操作需求 server 端和 client 端不同
import {getCookie, setCookie} from '../lib/cookie'
Vue.prototype.$cookie = {
    getCookie: getCookie,
    setCookie: setCookie
}

// 将 lodash 和 moment 引入全局
import _ from 'lodash'
import lid from 'lodash-id'
// 给 lodash 加上 .getById()
_.mixin(lid)
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
// 客户端挂载 window 下
window._ = _
window.moment = moment

import {sleep} from '../lib/utility'
window.SLEEP = sleep
