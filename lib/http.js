/**
 * 网络访问模块，前后端代码共享
 */

const axios = require('axios')
const {config} = require('../nuxt.config.js')

const request = axios.create({
    baseURL: config.shared.baseURL,
    timeout: config.shared.timeout
})

async function get(url,opt,times) {
    // 响应模板
    let ret = {
        // 完全符合预期
        OK: false,
        // 请求失败，一般是网络问题
        FAIL: false,
        // 服务器响应错误，状态码不是 2xx
        ERROR: false,
        // 因为配置出错导致无法请求
        INVALID: false,
        // 服务器正常响应，但是返回数据非业务逻辑预期之内
        UNEXPECTED: false,
        // 数据
        data: null,
        // 信息（一般是错误提示）
        message: ''
    }
    // 重试次数
    if (times === undefined) times = 1
    try {
        let res = await request.get(url,opt)
        if (res.data.statusCode < 300) {
            ret.OK = true
            ret.data = res.data.data
            return ret
        }
        else {
            ret.UNEXPECTED = true
            console.log(res)
            ret.message = res.data.message
            return ret
        }
    }
    catch (error) {
        // 区分情况进行处理
        if (error.request) {
            // 请求已经发出，但是没有收到响应
            console.log(error.request)
            // 启动重试机制
            if (times < 3) {
                times = times + 1
                return await get(url,opt,times)
            }
            else {
                ret.FAIL = true
                ret.message = '服务器无响应'
                return ret
            }
        }
        else if (error.response) {
            // 请求已经发出，服务器也给出了响应，但是状态码不是 2XX
            console.log(error.response)
            // 启动重试机制
            if (times < 3) {
                times = times + 1
                return await get(url,opt,times)
            }
            else {
                ret.ERROR = true
                ret.message = `服务器返回错误代码：${error.response.status}，提示信息：${error.response.statusText}`
                return ret
            }
        }
        else {
            // 请求配置出错
            console.log('Error', error.message)
            // 启动重试机制
            if (times < 3) {
                times = times + 1
                return await get(url,opt,times)
            }
            else {
                ret.INVALID = true
                ret.message = '网络请求参数有误，请检查'
                return ret
            }
        }
    }
}

async function post(url,payload,opt,times) {
    // 响应模板
    let ret = {
        // 完全符合预期
        OK: false,
        // 请求失败，一般是网络问题
        FAIL: false,
        // 服务器响应错误，状态码不是 2xx
        ERROR: false,
        // 因为配置出错导致无法请求
        INVALID: false,
        // 服务器正常响应，但是返回数据非业务逻辑预期之内
        UNEXPECTED: false,
        // 数据
        data: null,
        // 信息（一般是错误提示）
        message: ''
    }
    // 重试次数
    if (times === undefined) times = 1
    try {
        let res = await request.post(url,payload,opt)
        // console.log(res.data)
        if (res.data.statusCode < 300) {
            ret.OK = true
            ret.data = res.data.data
            return ret
        }
        else {
            ret.UNEXPECTED = true
            ret.message = res.data.message
            return ret
        }
    }
    catch (error) {
        // 区分情况进行处理
        if (error.request) {
            // 请求已经发出，但是没有收到响应
            console.log(error.request)
            // 启动重试机制
            if (times < 3) {
                times = times + 1
                return await post(url,payload,opt,times)
            }
            else {
                ret.FAIL = true
                ret.message = '服务器无响应'
                return ret
            }
        }
        else if (error.response) {
            // 请求已经发出，服务器也给出了响应，但是状态码不是 2XX
            console.log(error.response)
            // 启动重试机制
            if (times < 3) {
                times = times + 1
                return await post(url,payload,opt,times)
            }
            else {
                ret.ERROR = true
                ret.message = `服务器返回错误代码：${error.response.status}，提示信息：${error.response.statusText}`
                return ret
            }
        }
        else {
            // 请求配置出错
            console.log('Error', error.message)
            // 启动重试机制
            if (times < 3) {
                times = times + 1
                return await post(url,payload,opt,times)
            }
            else {
                ret.INVALID = true
                ret.message = '网络请求参数有误，请检查'
                return ret
            }
        }
    }
}

export default {
    get: get,
    post: post
}