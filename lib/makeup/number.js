/**
 * 丰富原生 Number 类型
 */

Number.randomBetween = function (min, max) {
    // 参数检查
    if (min == undefined || max == undefined) throw new Error('Param missing, you must define both min and max number of your random range')
    if (Number.isNaN(min) || Number.isNaN(max)) throw new Error('The min and max param must be a number')
    let sp = (max >= min) ? min : max
    let fp = (max >= min) ? max : min
    let range = fp - sp
    let rdm = Math.random()
    return min + Math.round(rdm * range)
}
