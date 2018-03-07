/*
  处理微信业务逻辑
*/
const Wechat = require('./wechat/wechat')
const config = require('./config/default')
const _path = require('path')

const wechat = new Wechat(config.wechat)

exports.reply = async (ctx, next) => {
  // console.log(ctx.weixin, 'reply')
  // ctx.weixin是微信post过来的数据并且已经将xml解析成json
  let message = ctx.weixin

  if(message.MsgType === 'event') {
    if(message.Event === 'subscribe') {
      if(message.EventKey) {
        console.log(`扫码关注: EventKey:${message.EventKey}, ticket:${message.Ticket}`)
      }
      ctx.body = '欢迎来到桃花源\(^o^)/~'
    }
  } else if (message.MsgType === 'text') {

    let content = message.Content
    let reply = null
    let data = null

    switch(content) {
      case '1':
        reply = '1 李白是最秀的刺客'
        break
      case '2':
        // 图文小的图片必须来自微信服务器
        reply = [{
          title: '2.史上最秀刺客',
          description: '主一副二。对操作技术要求很高的英雄！将进酒是非常好的切入和逃跑技能，当然由于带有眩晕效果，也可以用来打先手！大招非常讲究，需要4下普攻来解封，非常考验玩家的切入走位，不然很容易死。',
          picUrl: 'https://mmbiz.qpic.cn/mmbiz_jpg/VGEbIsYsDkzzITCgXBWtHtnZzzPTZHicJEfrycDX3S8I9DwXu7L6zoRIgeiaCC3O3zkyAyzicbTria8taQ5IUfmRicA/0?wx_fmt=jpeg',
          url: 'http://news.4399.com/gonglue/wzlm/yingxiong/ck/m/555428.html'
        },
        {
          title: '剑圣 · 天下无双',
          description: '主一副二，无双和二天一流提供了非常舒服的控制，打团先手/后手都是极好的，而神速则提供了最棒的机动性！',
          picUrl: 'https://mmbiz.qpic.cn/mmbiz_png/VGEbIsYsDkwSTrvS4wUvhqrNxAf7hU27oeFo3Fuc6Zxb2FlI7CYQkCUlwW3So9e7cAoiaxoVl8pn9S0ibpoNShEQ/0?wx_fmt=png',
          url: 'http://news.4399.com/gonglue/wzlm/yingxiong/ck/m/536592.html'
        }]
        break
      case '3': // 上传临时图片
        await wechat.uploadMaterial('image', _path.join(__dirname, './static/upload/lb.jpg'))
          .then(res => {
            data = res           
          })
          console.log(data)
        reply = {
          type: data.type,
          mediaId: data.media_id
        }
        break
      case '4': // 上传临时视频
        await wechat.uploadMaterial('video', _path.join(__dirname, './static/upload/6-1vue.mp4'))
          .then(res => {
            data = res
          })
        reply = {
          type: 'video',
          mediaId: data.media_id,
          title: 'vuejs开发音乐app',
          description: 'imooc视频, vue开发音乐webapp'
        }
        break
      case '5': // 上传临时语音
        await wechat.uploadMaterial('voice',_path.join(__dirname, './static/upload/short.mp3'))
          .then(res => {
            data = res
          })
          
        reply = {
          type: data.type,
          mediaId: data.media_id
        }
        break
      case '6': // 上传永久图片
        await wechat.uploadMaterial('image', _path.join(__dirname, './static/upload/lb1.jpg'), {type: 'image'})
          .then(res => {
            data = res
          })
          console.log(data)
          reply = {
            type: 'image',
            mediaId: data.media_id
          }
        break
      case '7': // 上传永久视频
        await wechat.uploadMaterial('video', _path.join(__dirname, './static/upload/6-1vue.mp4'), {type: 'video',description:'{ "title":"web音乐app开发","introduction":"vue全家桶开发web音乐app"}'})
          .then(res => {
            data = res
          })
          console.log(data)
          reply = {
            type: 'video',
            mediaId: data.media_id,
            title: 'web音乐app开发',
            description: 'vue全家桶开发web音乐app'
          }
        break
      case '8':
        await wechat.delMaterial('vW9rnzZgjpXLvNa_n1KZJ-XpTNa7Oawd8QmQAC3-zJs')
          .then(res => {
            console.log(res)
          })
        reply = '删除永久素材'
        break
      case '10':
      let material = {
          articles: [
            {
              title: '李白是最秀刺客',
              thumb_media_id: 'vW9rnzZgjpXLvNa_n1KZJ7KHIGxjmQQy5vlPaAeG9V8',
              author: 'kay',
              digest: '李白是最秀刺客',
              show_cover_pic: 1,
              content: '李白是最秀刺客, 李白是最秀刺客',
              content_source_url: 'https://weibo.com/u/5648616151/home?wvr=5&sudaref=graph.qq.com'
            }
          ]
        }
        await wechat.uploadMaterial('news', material, {})
          .then(res => {
            console.log(res)
          })
        reply = '上传成功'
        break
      case '11':
        await wechat.getMaterial('vW9rnzZgjpXLvNa_n1KZJ442Nj1YLwY93UL04l5A0oM', 'video', {})
          .then(res => {
            console.log(res)
          })
          reply = '获取素材'
        break
      case '12':
        await wechat.batchMaterial({type: 'video', offset: 0, count: 10})
          .then(res => {
            console.log(res)
          })
          reply = '素材列表'
        break
      case '13':
        await wechat.countMaterial()
          .then(res => {
            console.log(res)
          })
        reply = '获取素材总数'
        break
      default:
        reply = `您的需求:${content}, 臣妾做不到`
        break
    }
    ctx.body = reply
  } else if (message.MsgType === 'image') {
    // console.log(message)
    ctx.body = '不许发图'
  }

  await next()
}