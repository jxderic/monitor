/*
 * @Descripttion: 
 * @Author: jinxiaodong
 * @Date: 2020-12-03 11:21:02
 * @LastEditors: jinxiaodong
 * @LastEditTime: 2020-12-03 11:52:32
 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
// dist清理
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 自动上传Map
const UploadSourceMapWebpackPlugin = require('../plugin/uploadSourceMapWebPackPlugin')

module.exports = {
  devtool: 'source-map', // SourceMap,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[hash].js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(),
    new UploadSourceMapWebpackPlugin({
      uploadUrl:'http://localhost:7001/monitor/sourcemap'
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
}