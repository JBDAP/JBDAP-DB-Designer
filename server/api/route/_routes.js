/**
 * 自动将所有 route 文件中定义的路由拼组成一个大数组
 */
'use strict'

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const conn = () => {
    // 创建当日的日志存储文件
    let logFile = process.cwd() + `/server/database/schemas.json`
    if (!fs.existsSync(logFile)) fs.writeFileSync(logFile,'')
    const adapter = new FileSync(logFile)
    const db = low(adapter)
    // 检查是否为空
    if (!db.has('updatedAt').value()) {
        db.defaults({
            projects: [],
            createdAt: new Date().dtString(),
            updatedAt: new Date().dtString(),
        }).write()
    }
    return db
}

// 系统日志，使用 lowdb 本地保存即可
let log = (target,type,source,content,info) => {
    // 创建当日的日志存储文件
    let logFile = process.cwd() + `/server/log/${new Date().dateString()}.json`
    if (!fs.existsSync(logFile)) fs.writeFileSync(logFile,'')
    const adapter = new FileSync(logFile)
    const db = low(adapter)
    // 检查是否为空
    if (!db.has('event').value()) {
        db.defaults({ event: [], error: [] }).write()
    }
    // 处理 info 格式
    if (_.isUndefined(info)) info = ''
    else if (_.isPlainObject(info)) info = JSON.stringify(info,null,4)
    else if (_.isString(info)) info = info
    else {
        if (info.toString) info = info.toString()
        else info = JSON.stringify(info)
    }
    // 日志内容
    let entity = {
        ts: new Date().getTime(),
        type: type,
        source: source,
        content: content,
        info: info,
        createdAt: new Date().dtString()
    }
    // 写入日志
    db.get(target).push(entity).write()
}

// 取出route列表
let allApiRoutes = []
let routeFiles = glob.sync(path.join(__dirname, '*.js'))
routeFiles.forEach(function(routeFile) {
    // 排除掉_开头的非标准route文件
    if (routeFile.indexOf("_") < 0) {
        let routes = require(routeFile)
        // 创建完整路由列表
        for (let i=0; i<routes.length; i++){
            allApiRoutes.push(routes[i])
        }
    }
})

module.exports = function (fastify, opts, next) {
    // 让 fastify 可以随处访问
    global.fastify = fastify
    // 让 fastify 支持文件上传
    fastify.register(require('fastify-multipart'))
    // 丰富 fastify 上下文环境
    fastify.decorate('db', conn)
    fastify.decorate('emptyReply', function () {
        return {
            statusCode: 200,
            message: 'ok',
            data: null,
            error: ''
        }
    })
    fastify.decorate('hash', require('../common/hash'))
    // 日志写入
    fastify.decorate('logEvent', (type,source,content,info) => {
        log('event',type,source,content,info)
    })
    fastify.decorate('logError', (type,source,content,info) => {
        log('error',type,source,content,info)
    })
    // 健康检查
    fastify.get('/health', async ()=>{
        fastify.logEvent('event','system','server','/api/health is requested')
        return 'ok'
    })
    // 导入全部路由
    _.each(allApiRoutes, (route) => {
        fastify.route(route)
    })
    // 交还控制权给 fastify
    next()
}
