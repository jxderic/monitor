/*
 * @Descripttion: 
 * @Author: jinxiaodong
 * @Date: 2020-12-02 11:31:49
 * @LastEditors: jinxiaodong
 * @LastEditTime: 2020-12-02 11:35:28
 */
import React from 'react'
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidCatch(error, info) {
    // 发生异常时打印错误
    console.log('componentDidCatch', error)
  }

  render() {
    return this.props.children
  }
}