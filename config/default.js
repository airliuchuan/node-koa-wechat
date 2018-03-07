const utils = require('../utils/util')
const _path = require('path')

const accessTokenTxt = _path.join(__dirname, './accessToken.txt')

const config = {
  port: 3000,
  wechat: {
    token: 'kayapp41',
    AppID: 'wx381831aac3370548',
    AppSecret: 'bc079cbfb2ee544efccffc1e37e6ad6b',
    getAccessToken() {
      return utils.readFileAsync(accessTokenTxt)
    },
    saveAccessToken(content) {
      return utils.writeFileAsync(accessTokenTxt, content)
    } 
  }
}

module.exports = config