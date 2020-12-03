/*
 * @Descripttion: 
 * @Author: jinxiaodong
 * @Date: 2020-12-03 11:21:11
 * @LastEditors: jinxiaodong
 * @LastEditTime: 2020-12-03 11:33:43
 */
function uploadError({ lineno, colno, error: { stack }, timeStamp, message,filename }) {
    // 过滤
    const info = { lineno, colno, stack, timeStamp, message ,filename}

    const str = Buffer.from(JSON.stringify(info)).toString("base64");
    console.log('str:', str)
    const host = 'http://localhost:7001/monitor/error'
    new Image().src = `${host}?info=${str}`

}

new Promise((resolve, reject) => {
  error()
})
window.addEventListener("unhandledrejection", e => {
  throw e.reason
});

window.addEventListener('error', errorInfo => {
    console.log('EventListener:', errorInfo)

    uploadError(errorInfo)
    return true
}, true)

setTimeout(() => {
    xxx(1223)
}, 1000)