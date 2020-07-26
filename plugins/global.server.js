/**
 * 这个插件是对基础开发环境的增强
 * 只作用于 server 端
 */

// 应用 ant-design-vue 库
import Vue from 'vue'

// 给 Vue 实例挂载 cookie 操作工具
// 注意对 cookie 的操作需求 server 端和 client 端不同
import {getCookieFromStr, makeSetCookieStr} from '../lib/cookie'
Vue.prototype.$cookie = {
    getFromStr: getCookieFromStr,
    makeSetStr: makeSetCookieStr
}

// 将 lodash 和 moment 引入全局
import _ from 'lodash'
import lid from 'lodash-id'
// 给 lodash 加上 .getById()
_.mixin(lid)
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
// server 端挂在 global 下
global._ = _
global.moment = moment

import {sleep} from '../lib/utility'
global.SLEEP = sleep
