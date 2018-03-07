const sha1 = require('sha1')
const rawBody = require('raw-body')
const wechatUtil = require('./wechat-util')
const Wechat = require('./wechat')

const wechatHandle = (opts, handle) => {
  let wechat = new Wechat(opts)
  return async (ctx, next) => {
    let token = opts.token,
        timestamp = ctx.query.timestamp,
        nonce = ctx.query.nonce,
        signature = ctx.query.signature,
        echostr = ctx.query.echostr
    let tmpStr = [token, timestamp, nonce].sort().join('')
    let shaStr = sha1(tmpStr)

    if(ctx.method === 'GET') {
      // 配置服务器
      ctx.body = shaStr === signature ? echostr : 'failed'
    } else if(ctx.method === 'POST') { // 处理微信发来的post请求
      
      // 验证token
      if(shaStr !== signature) {
        this.body = 'failed'
        return false
      }

      let content = null, // 接收的xml
          message = null // 转译后的xml进行格式化的后的json
      await rawBody(ctx.req, {
        length: ctx.lenght,
        limit: '1mb',
        encoding: ctx.charset
      }).then( res => {
        content = res.toString()
      })
      await wechatUtil.parserXml(content).then(res => {
        message = wechatUtil.formatMessage(res.xml)
      })
      
      ctx.weixin = message // 挂载消息
      // 将中间件的参数传到handle里, 在handlei处理回去逻辑
      await handle.call(this, ctx, next) // 这里遇到了一个瓶颈, 挂载的消息message只能通过ctx来传递, 需要用call来吧ctx和next继承下去
      // 在wechat.js里真正回复
      wechat.replay.call(this, ctx)
    }
  }
}

module.exports = wechatHandle