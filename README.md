# 建开发服务器的方式有很多，如购买云服务器、使用花生壳、ngrok、localtunnel等。这里为了简单起见采用localtunnel。先全局方式安装localtunnel,
这里使用ngrok:
1. 下载 MAC 版的 
```
ngrok：https://ngrok.com/download
```
2. 解压到指定目录：
```
$ unzip -n ngrok-stable-darwin-amd64.zip -d /tmp
```
3. 进入到解压后的 ngrok 所在路径：
```
$ cd /tmp
```
4. 开启服务：
```
$ ./ngrok http localhost:8080
```
输入命令后, 稍等片刻，等 Session Status 显示为 online 状态时即可使用外网访问。即：以前使用http://localhost:8080/testWeb 访问，现在便可使用http://744fb6df.ngrok.io/testWeb进行访问，http://744fb6df.ngrok.io 就是本地服务映射到外网的地址。其中 744fb6df 不是固定的，在每次开始 ngrok 服务的时候都会变更。可以指定域名,但是要收费的, 我用的是mac所以不关机,没事哈哈, 免费的就这样

# 对于xml转json的处理, 以及返回的xml模板的处理是两大难点
1. xml转json需要用到xml2js模块
2. 对json的格式化需要手动写个处理方法
3. 返回的xml模板需要用到heredoc和ejs

# 判断是否是数组的方法
1. Array.isArray([arr])
2. [arr] instanceof Array
3. 区别..... todo

# 上传临时素材和永久素材合并为一个接口
1. 临时素材的配置
  - type: 图片（image）、语音（voice）、视频（video）和缩略图（thumb）
  - options: url: api.tempMaterial.upload, method: post, formData: form(createReadStream(media))