/**
 * 这个插件是对基础开发环境的增强
 * 同时作用于 server 端和 client 端
 */

// 对原生 js 的增强
import '../lib/makeup'

// 引入 Vue 以备使用
import Vue from 'vue'

// 引入基础组件
import Button from 'ant-design-vue/lib/button'
Vue.use(Button)
import Layout from 'ant-design-vue/lib/layout'
Vue.use(Layout)
import Spin from 'ant-design-vue/lib/spin'
Vue.use(Spin)
import Icon from 'ant-design-vue/lib/icon'
Vue.use(Icon)
import Empty from 'ant-design-vue/lib/empty'
Vue.use(Empty)
import Divider from 'ant-design-vue/lib/divider'
Vue.use(Divider)
import Dropdown from 'ant-design-vue/lib/dropdown'
Vue.use(Dropdown)
// 引入布局和导航组件
import Row from 'ant-design-vue/lib/row'
Vue.use(Row)
import Col from 'ant-design-vue/lib/col'
Vue.use(Col)
import Menu from 'ant-design-vue/lib/menu'
Vue.use(Menu)
import Breadcrumb from 'ant-design-vue/lib/breadcrumb'
Vue.use(Breadcrumb)
import Card from 'ant-design-vue/lib/card'
Vue.use(Card)
import Tabs from 'ant-design-vue/lib/tabs'
Vue.use(Tabs)
// 引入数据展示组件
import Table from 'ant-design-vue/lib/table'
Vue.use(Table)

// 引入表单相关组件
import Form from 'ant-design-vue/lib/form'
Vue.use(Form)
import Input from 'ant-design-vue/lib/input'
Vue.use(Input)
import Select from 'ant-design-vue/lib/select'
Vue.use(Select)
import Radio from 'ant-design-vue/lib/radio'
Vue.use(Radio)
import Checkbox from 'ant-design-vue/lib/checkbox'
Vue.use(Checkbox)
// 引入提醒交互组件
import Alert from 'ant-design-vue/lib/alert'
Vue.use(Alert)
import Popover from 'ant-design-vue/lib/popover'
Vue.use(Popover)
import Tooltip from 'ant-design-vue/lib/tooltip'
Vue.use(Tooltip)
import message from 'ant-design-vue/lib/message'
message.config({
    top: `78px`,
    duration: 3,
    maxCount: 3,
});
Vue.prototype.$message = message;
import notification from 'ant-design-vue/lib/notification'
Vue.prototype.$notification = notification;
import Modal from 'ant-design-vue/lib/modal'
Vue.use(Modal)
Vue.prototype.$info = Modal.info;
Vue.prototype.$success = Modal.success;
Vue.prototype.$error = Modal.error;
Vue.prototype.$warning = Modal.warning;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$destroyAll = Modal.destroyAll;

// 引入剪贴板组件
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// 给 Vue 实例挂载封装后的 axios 模块
import http from '../lib/http'
Vue.prototype.$http = http

// 给 Vue 实例挂载一个 locale 配置
// 这个 dtLocale 会被指定给 antd 的日期组件以保证其中文界面
Vue.prototype.$dtLocale = {
    "lang": {
        "placeholder": "请选择日期",
        "rangePlaceholder": ["开始日期", "结束日期"],
        "today": "今天",
        "Today": "今天",
        "now": "此刻",
        "backToToday": "回到今天",
        "ok": "确定",
        "clear": "清除",
        "month": "月份",
        "year": "年份",
        "timeSelect": "选择时间",
        "dateSelect": "选择日期",
        "monthSelect": "选择月份",
        "yearSelect": "选择年份",
        "decadeSelect": "选择年代",
        "yearFormat": "YYYY",
        "dateFormat": "YYYY-MM-DD",
        "dayFormat": "DD",
        "dateTimeFormat": "YYYY-MM-DD HH:mm:ss",
        "monthFormat": "MMMM",
        "monthBeforeYear": true,
        "previousMonth": "上个月 (PageUp)",
        "nextMonth": "下个月 (PageDown)",
        "previousYear": "前一年 (Control + left)",
        "nextYear": "后一年 (Control + right)",
        "previousDecade": "前十年",
        "nextDecade": "后十年",
        "previousCentury": "上个世纪",
        "nextCentury": "下个世纪"
    },
    "timePickerLocale": {
        "placeholder": "请选择时间"
    }
}
