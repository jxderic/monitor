/*
 * @Descripttion: 
 * @Author: jinxiaodong
 * @Date: 2020-12-03 10:17:24
 * @LastEditors: jinxiaodong
 * @LastEditTime: 2020-12-03 14:39:58
 */
const Controller = require('egg').Controller
const fs = require('fs')
const path = require('path')

class MonitorController extends Controller {
  async index() {
    const { ctx } = this
    const { info } = ctx.query
    const json = JSON.parse(Buffer.from(info, 'base64').toString('utf-8'))
    console.log('fronterror:', json)
    // 记录错误日志
    ctx.getLogger('frontendLogger').error(json)
    ctx.body = ''
  }

  async upload() {
    const { ctx } = this
    const stream = ctx.req
    const filename = ctx.query.name
    const dir = path.join(this.config.baseDir, 'uploads')
    //判断uploads目录是否存在
    if(!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    const target = path.join(dir, filename)
    const writeStream = fs.createWriteStream(target)
    stream.pipe(writeStream)
  }
}

module.exports = MonitorController