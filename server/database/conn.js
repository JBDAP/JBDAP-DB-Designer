const jbdap = require('jbdap-engine')
const config = require('./envs.json')

// 引用 envs.json 配置的数据库环境
let connection = (process.env.NODE_ENV === 'development') ? config.dev : config.prod
delete connection.driver
module.exports = jbdap.knex({
    client: 'mysql2',
    connection: connection
})
