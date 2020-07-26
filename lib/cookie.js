/**
 * Cookie 操作，服务端客户端共享代码
 */

const {config} = require('../nuxt.config.js')
const slc = config.shared.sessionLifeCycle

export function getCookie(cname) {
    let name = cname + '='
    let ca = document.cookie.split(';')
    for(let i=0; i<ca.length; i++) {
        let c = ca[i].trim()
        if (c.indexOf(name)==0) return c.substring(name.length,c.length)
    }
    return ''
}

export function setCookie(cname,cvalue,exMinutes,path){
    let d = new Date()
    exMinutes = exMinutes === undefined ? slc : exMinutes
    d.setTime(d.getTime()+(exMinutes*60*1000))
    let expires = 'expires='+d.toGMTString()
    let str = cname + '=' + cvalue + '; '
    if (exMinutes > 0) str += expires + '; '
    if (path) str += 'path=' + path + '; '
    else str += 'path=/; '
    document.cookie = str
}

export function getCookieFromStr(content,cname) {
    if (content === undefined) return ''
    let name = cname + '='
    let ca = content.split(';')
    for(let i=0; i<ca.length; i++) {
        let c = ca[i].trim()
        if (c.indexOf(name)==0) return c.substring(name.length,c.length)
    }
    return ''
}

export function makeSetCookieStr(cname,cvalue,exMinutes,path){
    let d = new Date()
    exMinutes = exMinutes === undefined ? slc : exMinutes
    d.setTime(d.getTime()+(exMinutes*60*1000))
    let expires = 'expires='+d.toGMTString()
    let str = cname + '=' + cvalue + '; '
    if (exMinutes > 0) str += expires + '; '
    if (path) str += 'path=' + path + '; '
    else str += 'path=/; '
    return str
}
