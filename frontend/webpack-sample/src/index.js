/*
 * @Descripttion: 
 * @Author: jinxiaodong
 * @Date: 2020-12-03 11:21:11
 * @LastEditors: jinxiaodong
 * @LastEditTime: 2020-12-03 11:33:43
 */

setTimeout(() => {
    xxx(1223)
}, 1000)

window.addEventListener("unhandledrejection", e => {
  throw e.reason
});

window.addEventListener('error', errorInfo => {
    console.log('EventListener:', errorInfo)

    uploadError(errorInfo)
    return true
}, true)