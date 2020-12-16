/*
 * @Descripttion: 
 * @Author: jinxiaodong
 * @Date: 2020-12-04 11:16:12
 * @LastEditors: jinxiaodong
 * @LastEditTime: 2020-12-04 11:51:07
 */
const ErrorStackParser = require('error-stack-parser')
const { SourceMapConsumer } = require('source-map')
const path = require('path')
const fs = require('fs')
module.exports = class StackParser {
  constructor(sourceMapDir) {
    this.sourceMapDir = sourceMapDir
    this.consumers = {}
  }

  /**
   * 序列化错误栈
   *
   * @param {*} stack 原始错误栈
   * @param {*} message 错误信息
   * @returns
   */
  parseStackTrack(stack, message) {
    const error = new Error(message)
    error.stack = stack
    const stackFrame = ErrorStackParser.parse(error)
    return stackFrame
  }

  async getOriginPosition(stackFrame) {
    let { columnNumber, lineNumber, fileName } = stackFrame
    fileName = path.basename(fileName)
    // 判断consumer是否存在
    let consumer = this.consumers[fileName]
    if (!consumer) {
      // 读取sourcemap
      const sourceMapPath = path.resolve(this.sourceMapDir, fileName + '.map')
      // 判断文件是否存在
      if (!fs.existsSync(sourceMapPath)) {
        return stackFrame
      }
      const content = fs.readFileSync(sourceMapPath, 'utf-8')
      consumer = await new SourceMapConsumer(content, null)
      this.consumers[fileName] = consumer
    }
    const parseData = consumer.originalPositionFor({line: lineNumber,column: columnNumber})
    return parseData
  }

  async getOriginalErrorStack(stackFrame) {
    const origin = []
    for(let v of stackFrame) {
      origin.push(await this.getOriginPosition(v))
    }
    return origin
  }
}