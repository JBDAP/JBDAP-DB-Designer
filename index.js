/**
 * nuxt 的启动入口，这里是通过 fastify 来进行托管
 */

// 让 lodash 在服务端到处可用
let _ = require('lodash')
// 给 lodash 加上 .getById()
_.mixin(require('lodash-id'))
global._ = _

// 增强原生 js
require('./lib/makeup')

const { Nuxt, Builder } = require('nuxt')
const fastify = require('fastify')({
  logger: false
})

// Import and Set Nuxt.js options
let config = require('./nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  // 这里的 nuxt.config.server 就等于 config.server
  const host = nuxt.options.server.host
  const port = nuxt.options.server.port

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  
  // 官方模板中直接使用 nuxt.render 接管了所有请求，如下：
  // fastify.use(nuxt.render)
  // 如果我们想要增加自己的路由（比如 API 的处理）
  // 就需要自己写一个插件来实现
  fastify.register(require('./server/api/route/_routes'), { prefix: '/api' })

  // 然后再将所有 get 请求统一交给 nuxt.render 处理
  // 以此来实现自定义路由和 nuxt 定义路由的并存
  fastify.get('*', (req, res)=>{
    nuxt.render(req.raw, res.raw)
  })

  fastify.listen(port, host, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`nuxt server is running on ${host}:${port}`)
  })
}

start()
