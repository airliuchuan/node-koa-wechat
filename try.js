const ejs = require('ejs')
const heredoc = require('heredoc')
const path = require('path')
const fs = require('fs')

// ejs和heredoc的学习
// ejs.render()和ejs.renderFile()会直接返回一个html结构, 通过第二个参数给模板传数据
// ejs.compile()会把结果编译成一个函数, 调用函数或会输出html接口, 并且可以传一个json进去给模板传数据
const str = heredoc(function () {/*
<html>
  <head>
  </head>
  <body>
    <div>
    <%= name %>
    <div>
  </body>
</html>
*/})

const hh = ejs.compile(str)({name: 'zxk'})
// console.log(hh)

// -----------------------------------------------

var buf = fs.createReadStream('lb.jpg')
// console.log(buf)


const request = require('./utils/util')._reqest

request({method: 'POST', url: 'https://www.jianshu.com/notes/b240051784ab/mark_viewed.json', form: {uuid:'67f621e0-3891-4c1d-be60-964601ed1f50',referrer: 'https://www.jianshu.com/search?q=node%E6%A8%A1%E5%9D%97%20request&page=1&type=note'}})
  .then(res => {
    console.log(res)
  })