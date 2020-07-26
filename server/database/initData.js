const { insert } = require('./tool.js')
const { md5 } = require('../api/common/hash')

// 初始化数据
async function initData() {
    try {
      // Account 数据
      await insert('Account', {
        username: 'admin',
        password: md5('123456'),
        role: '超管',
        authority: '{}'
      })
    }
    catch (err) {
      throw err
    }
}

initData().then(()=>{
    process.exit(0)
}).catch((err)=>{
    throw err
})
