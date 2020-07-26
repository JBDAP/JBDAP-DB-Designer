const conn = require('./conn.js')

exports.createTable = async function(db, name, columns) {
    // 为保证列的顺序需要拷贝一下
    let finalCols = {}
    // 先添加 id
    if (!columns.id) {
        finalCols.id = {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        }
    }
    // 拷贝原有列信息
    let keys = Object.keys(columns)
    for (let i=0; i<keys.length; i++) {
        finalCols[keys[i]] = columns[keys[i]]
    }
    // 添加行时间戳
    if (!columns.createdAt) {
        finalCols.createdAt = {
            type: 'datetime',
            isNull: true
        }
    }
    if (!columns.updatedAt) {
        finalCols.updatedAt = {
            type: 'datetime',
            isNull: true
        }
    }
    return await db.createTable(name, finalCols)
}

exports.dropTable = async function(db, name) {
    return await db.dropTable(name,{ ifExists: true })
}

// 使用 knex 语法插入数据
exports.insert = async function(name, entity) {
    if (!entity.createdAt) entity.createdAt = new Date().dtString()
    if (!entity.updatedAt) entity.updatedAt = new Date().dtString()
    return conn(name).insert(entity)
}