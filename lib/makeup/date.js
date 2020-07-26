/**
 * 对原生 Date 的增强，前后端通用代码
 */

// 需要引用 string 模块
if (!String.prototype.padLeft) require('./string')

Date.makeOne = function(year,month,day,hour,minute,second,ms) {
    return new Date(year,month-1,day,hour||0,minute||0,second||0,ms||0)
}

Date.prototype.addMinutes = function (number) {
    if (number == undefined) throw new Error('Param missing, please input the minutes you want to add as the first param')
    if (Number.isNaN(number)) throw new Error('The minutes you want to add must be a number')
    return new Date(this.getTime() + 60 * 1000 * number)
}

Date.prototype.addHours = function (number) {
    if (number == undefined) throw new Error('Param missing, please input the minutes you want to add as the first param')
    if (Number.isNaN(number)) throw new Error('The minutes you want to add must be a number')
    return new Date(this.getTime() + 60 * 60 * 1000 * number)
}

Date.prototype.addDays = function (number) {
    if (number == undefined) throw new Error('Param missing, please input the minutes you want to add as the first param')
    if (Number.isNaN(number)) throw new Error('The minutes you want to add must be a number')
    return new Date(this.getTime() + 24 * 60 * 60 * 1000 * number)
}

Date.prototype.dateString = function () {
    return this.getFullYear() + '-' + (this.getMonth() + 1).toString().padLeft(2,'0') + '-' + this.getDate().toString().padLeft(2,'0')
}

Date.prototype.timeString = function () {
    return this.getHours().toString().padLeft(2,'0') + ':' + this.getMinutes().toString().padLeft(2,'0') + ':' + this.getSeconds().toString().padLeft(2,'0')
}

Date.prototype.dtString = function () {
    return this.dateString() + ' ' + this.timeString()
}
