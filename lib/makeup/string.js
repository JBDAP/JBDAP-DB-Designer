/**
 * 对原生 String 的增强，前后端通用代码
 */

// 为了兼容 server 直接调用，故而不用 import 写法
const EOL = require('os')

// 替换全部匹配字符串
String.prototype.replaceAll = function (s1, s2) {
    if (s1 == undefined) throw new Error('Param missing, you must input the string to be replaced as the first param')
    if (Object.prototype.toString.call(s1) !== '[object String]' || s1 == '') throw new Error('The thing you want to search must be a non-empty string')
    if (s2 == undefined) throw new Error('Param missing, you must input the new string as the second param')
    if (Object.prototype.toString.call(s2) !== '[object String]') throw new Error('The thing you want to replace with must be a string')
    let regExps = [
        /\$/g,
        /\*/g,
        /\+/g,
        /\./g,
        /\?/g,
        /\\/g,
        /\//g,
        /\^/g,
        /\|/g,
        /\(/g,
        /\)/g,
        /\[/g,
        /\]/g,
        /\{/g,
        /\}/g
    ]
    let chars = [
        '\\$',
        '\\*',
        '\\+',
        '\\.',
        '\\?',
        '\\\\',
        '\\/',
        '\\^',
        '\\|',
        '\\(',
        '\\)',
        '\\[',
        '\\]',
        '\\{',
        '\\}'
    ]
    // 先将 s1 转成正则所需的字符串
    for (let i=0; i<regExps.length; i++) {
        s1 = s1.replace(regExps[i],chars[i])
    }
    // 将处理后的 s1 转成正则表达式（全局替换、多行模式）
    let regExp = new RegExp(s1, 'gm')
    // 替换全部
    return this.replace(regExp, s2)
}

// 移除所有空格
String.prototype.removeBlank = function () {
    return this.replaceAll(' ', '')
}

// 移除所有换行符
String.prototype.removeEOL = function () {
    return this.replaceAll(EOL, '')
}

// 左右字符串填充
function padCharTo(oldStr,side,len,char) {
    // 参数检查
    if (len == undefined) throw new Error('Param missing, you must input the lenth to achieve as the first param')
    if (!Number.isInteger(len) || len == 0) throw new Error('The length you want to achieve must be a non-zero integer')
    if (char == undefined) throw new Error('Param missing, you must input the pad character as the second param')
    if (Object.prototype.toString.call(char) !== '[object String]' || char.length != 1) throw new Error('The pad character must be a string which contains only 1 character')
    // 填充字符
    let str = ''
    if (oldStr.length < len) for (let i = 1; i <= len - oldStr.length; i++) str += char
    if (side == 'left') return str + oldStr
    if (side == 'right') return oldStr + str
}

String.prototype.padLeft = function (len, char) {
    return padCharTo(this, 'left', len, char)
}

String.prototype.padRight = function (len, char) {
    return padCharTo(this, 'right', len, char)
}