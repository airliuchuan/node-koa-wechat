/*
  创建微信核心类
  获取accessToken
  上传获取临时素材等
*/
const request = require('../utils/util')._reqest
const req = require('request')
const config = require('../config/default')
const wechatUtil = require('./wechat-util')
const fs = require('fs')


const prefix = 'https://api.weixin.qq.com/cgi-bin/'
                
const api = {
  accessToken: prefix + 'token?grant_type=client_credential', // 获取token
  tempMaterial: {
    upload: prefix + 'media/upload?', // 上传临时素材
    get: prefix + 'media/get?' // 获取临时素材
  },
  permMaterial: {
    uploadNews: prefix + 'material/add_news?', // 上传永久图文
    uploadPic: prefix + 'media/uploadimg?', // 上传永久图片
    uploadOther: prefix + 'material/add_material?', // 上传永久其他素材
    get: prefix + 'material/get_material?', // 获取永久素材
    batchMaterial: prefix + 'material/batchget_material?', // 获取永久素材列表
    countMaterial: prefix + 'material/get_materialcount?', // 获取永久素材总数
    del: prefix + 'material/del_material?' // 删除永久素材
  }
}


class Wechat {
  constructor(opts) {
    this.AppID = opts.AppID
    this.AppSecret = opts.AppSecret
    this.accessToken = opts.token
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()
  }
  // 在这里为原型添加方法
  fetchAccessToken () {

    // 先从本地读取accessToken, 
    return this.getAccessToken().then(res => {
      try {
        // 如果有, 
        res = JSON.parse(res)
      } catch(e) {
        // 没有就去获取新的token, 并return
        return this.updateAccessToken()
      }
      // 如果有 验证是否有效
      if(this.isValidAccessToken(res)) {
        // 有效返回获取的token
        return Promise.resolve(res)
      } else {
        console.log('重新获取 过期')
        // 无效重新获取token
        return this.updateAccessToken()
      }
    }).then(res => {
      
      // 将新的token写入txt文件
      this.saveAccessToken(JSON.stringify(res))
      // 返回一个新token的Promise
      console.log('res', '写入操作')
      return Promise.resolve(res)
    })
  }
  isValidAccessToken (data) {
    if(!data || !data.access_token || !data.expires_in) return false
    let expires_in = data.expires_in
    let now = new Date().getTime()
    return now < expires_in ? true : false
  }
  updateAccessToken() {
    return new Promise((resolve, reject) => {
      let url = api.accessToken + '&appid=' + this.AppID + '&secret=' + this.AppSecret
      request({url: url}).then(res => {
        let now = new Date().getTime()
        let expires_in = now + (res.expires_in - 20) * 1000
        res.expires_in = expires_in
        resolve(res)
      }).catch(err => {
        console.error(err, 'updateAccessToken')
      })
    })
  }
  replay(ctx) {
    let content = ctx.body // 服务器返回给微信的内容
    let message = ctx.weixin // 微信post过来的内容已解析
    console.log(content, 'fun-replay')
    let xml = wechatUtil.tpl(content, message)
    ctx.body = xml
  }
  // 上传永久素材借口有次数限制(包括测试账号)
  uploadMaterial(type, pathOrNews, perm) { // perm: 对象,
    let form = {} 
    let uploadUrl = api.tempMaterial.upload
    if(perm) {
      uploadUrl = api.permMaterial.uploadOther
      form = Object.assign({}, form, perm)
    }
    if(type === 'pic') { // 上传永久图片消息的图片
      uploadUrl = api.permMaterial.uploadPic
    }
  
    if(type === 'news') { // 上传永久图文消息
      uploadUrl = api.permMaterial.uploadNews
      form = pathOrNews
    } else {
      form.media = fs.createReadStream(pathOrNews)
    }
  
    return new Promise((resolve, reject) => {
      
      this.fetchAccessToken().then(res => {
        
        let url = `${uploadUrl}access_token=${res.access_token}`
        if(!perm) {
          url += `&type=${type}`
        } else {
          form.access_token = res.access_token
        }
        let options = {
          method: 'POST',
          url: url
        }
        if (type === 'news') {
          options.body = form
        } else {
          options.formData = form
        }
       
        // 上传素材
        request(options)
          .then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
      })
    })
    
  }
  // 获取临时或永久素材 有点问题, 先获取全部图文再调这个
  getMaterial(mediaId, type, perm) {
    let getUrl = api.tempMaterial.get
    if(perm) {
      getUrl = api.permMaterial.get
    }
    return new Promise((resolve, reject) => {
      this.fetchAccessToken().then(res => {

        let url = getUrl + 'access_token=' + res.access_token
        let form = {}
        let options = {url: url, method: 'POST'}
        if(perm) {
          form.media_id = mediaId
          form.access_token = res.access_token
          options.body = form
        } else {
          if(type === 'video') {
            url = url.replace('https://', 'http://')
          }
          url += '&media_id=' + mediaId
        }
        if(type === 'news' || type === 'video') {
          console.log(type)
          request(options).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
        } else {
          resolve(url)
        }
        
      })
    })
    
  }
  // 获取永久素材列表
  batchMaterial(options) {
    
    options.type = options.type || "image",
    options.offset = options.offset || 0,
    options.count = options.count || 10
    
    return new Promise((resolve, reject) => {
      
      this.fetchAccessToken().then(res => {     
        let url = api.permMaterial.batchMaterial + 'access_token=' + res.access_token
        console.log(url)
        request({url: url, method: 'POST', body: options}).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    })
    
  }
  // 获取永久素材总数
  countMaterial() {
    return new Promise((resolve, reject) => {
      this.fetchAccessToken().then(res => {
        request({url: api.permMaterial.countMaterial + 'access_token=' + res.access_token}).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
      
    })
  }
  // 删除永久素材
  delMaterial(mediaId) {
    let form = {
      media_id: mediaId
    }
    return new Promise((resolve, reject) => {
      this.fetchAccessToken().then(res => {
        let url = api.permMaterial.del + 'access_token=' + res.access_token
        req({url: url, method: 'POST', form: form}, function(e,r,body) {
          console.log(body)
          resolve(body)
        })
      })
    })
    
  }

}

module.exports = Wechat