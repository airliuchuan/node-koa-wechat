const Koa = require('koa')
const wechatHandle = require('./wechat/middleware')
const config = require('./config/default')
const util = require('./utils/util')
const weixin = require('./winxin')

const app = new Koa()

// 验证token配置服务器
app.use(wechatHandle(config.wechat, weixin.reply))


app.listen(config.port)