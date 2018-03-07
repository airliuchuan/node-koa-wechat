const request = require('request')
const fs = require('fs')

exports._reqest = (options) => {
   
  let opt = {
    url: options.url || '',
    method: options.method || 'GET',
    json: options.json || true,
    body: options.body || null,
    formData: options.formData || null
  }

  return new Promise((resolve, reject) => {
    if(opt.method === 'POST') {
      if(opt.body) {
        request({url: opt.url, method: opt.method, json: opt.json, body: opt.body}, (e, r, body) => {
          // console.log(r) 
          if(e) reject(e)       
          else resolve(body)
        })
      } else if(opt.formData) {
        request({url: opt.url, method: opt.method, json: opt.json, formData: opt.formData}, (e, r, body) => {
        
          if(e) reject(e)
          else resolve(body)
        })
      } 
    } else if(opt.method === 'GET') {
      request({url: opt.url, method: opt.method, json: opt.json}, (e, r, body) => {
        if(e) reject(e)
        else resolve(body)
      })
    }
    
   
  })
}

exports.readFileAsync = (path,encoding) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if(err) reject(err)
      else resolve(data)
    })
  })
}

exports.writeFileAsync = (path,content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, err => {
      if(err) reject(err)
      else resolve()
    })
  })
}