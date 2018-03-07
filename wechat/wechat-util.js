const xml2js = require('xml2js')
const compiled = require('./xmlTpl')

exports.parserXml = (xml) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, res) =>{
      err ? reject(err) : resolve(res)
    })
  })
}

// 这个东西以后要回过头来着重搞搞
exports.formatMessage = (result) => {
  let message = {}
  if(typeof result === 'object') {
    let keys = Object.keys(result)
    for(let i = 0; i < keys.length; i ++) {
      let key = keys[i]
      let item = result[key]
      if(!(item instanceof Array) || !item.length) continue
      if(item.length === 1) {
        let val = item[0]
        if(typeof val === 'object') message[key] = formatMessage(val)
        else message[key] = (val || '').trim()
      } else {
        message[key] = []
        for(let j = 0; j < item.length; j++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
    return message
  }
}

// 回复的xml模板
exports.tpl = (content, message) => {
  let info = {}
  let toUserName = message.ToUserName
  let fromUserName = message.FromUserName
  let createTime = new Date().getTime()
  let type = 'text'
  
  if(Array.isArray(content)) type = 'news'
  info.msgType = content.type || type
  info.toUserName = fromUserName
  info.fromUserName = toUserName
  info.createTime = createTime
  info.content = content
  return compiled(info)
}