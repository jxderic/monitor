# 前端异常监控

日常开发中debugger是最频繁的工作，大部分时间都花在修改缺陷上面，很多错误都不是一下子就能解决，特别是一些线上压缩代码，调试通常都需要本地代理到线上进行联调，那如果能监控前端异常，还原错误是不是可以快速定位问题呢。

### 前端错误收集

#### js异常

同步的错误会阻塞进程，很容易就能察觉，但异步的报错，如果不涉及到其中的交互，通常都毫无察觉，打开F12才能发觉。

```JavaScript
setTimeout(() => {
    console.log('1->begin')
    error
    console.log('1->end')
})
setTimeout(() => {
    console.log('2->begin')
    console.log('2->end')
})
```

![](./images/js_error.png)

上面的例子我们用setTimeout分别启动了两个任务，虽然第一个任务执行了一个错误的方法。程序执行停止了。但是另外一个任务并没有收到影响。

其实如果你不打开控制台都看不到发生了错误。好像是错误是在静默中发生的。

下面我们来看看这样的错误该如何收集。

##### try-catch

我们首先想到的就是通过try-catch来收集。

```javascript
setTimeout(() => {
  try {
    console.log('1->begin')
    error
    console.log('1->end')
  } catch (e) {
    console.log('catch',e)
  }
})
```

![](./images/tryCatch.png)

 如果在函数中错误没有被捕获，错误会上抛。 

```javascript
function fun1() {
  console.log('1->begin')
  error
  console.log('1->end')
}
setTimeout(() => {
  try {
    fun1()
  } catch (e) {
    console.log('catch',e)
  }
})
```

![](./images/errorStack.png)

 控制台中打印出的分别是错误信息和错误堆栈。 

 读到这里大家可能会想那就在最底层做一个错误try-catch不就好了吗 , 但是理想很丰满，现实很骨感。我们看看下一个例子 。

```javascript
function fun1() {
  console.log('1->begin')
  error
  console.log('1->end')
}

try {
  setTimeout(() => {
    fun1()

  })
} catch (e) {
  console.log('catch', e)
}
```

![](./images/notCatch.png)

 大家注意运行结果，异常并没有被捕获。 

 这是因为JS的try-catch功能非常有限一遇到异步就不好用了。那总不能为了收集错误给所有的异步都加一个try-catch吧 。

##### window.onerror

 window.onerror 最大的好处就是可以同步任务还是异步任务都可捕获。 

```javascript
function fun1() {
  console.log('1->begin')
  error
  console.log('1->end')
}
window.onerror = (...args) => {
  console.log('onerror:',args)
}

setTimeout(() => {
  fun1()
})
```



![](./images/onerror.png)

 onerror还有一个问题大家要注意 如果返回true 就不会被上抛了。不然控制台中还会看到错误日志。 

```
function fun1() {
  console.log('1->begin')
  error
  console.log('1->end')
}
window.onerror = (...args) => {
  console.log('onerror:',args)
  return true
}

setTimeout(() => {
  fun1()
})
```

![](./images/onerrorReturn.png)

##### 监听error事件

> window.addEventListener('error',() => {}） 

 其实onerror固然好但是还是有一类异常无法捕获。这就是网络异常的错误。比如下面的例子。 

```
<img src="./xxxxx.png" />
```

 试想一下我们如果页面上要显示的图片突然不显示了，而我们浑然不知那就是麻烦了。 

```javascript
window.addEventListener('error', args => {
    console.log(
      'error event:', args
    );
    return true;
  }, 
  true // 利用捕获方式
);
```

![](./images/addEventListener.png)

##### Promise异常捕获

 Promise的出现主要是为了让我们解决回调地域问题。基本是我们程序开发的标配了。 

```javascript
new Promise((resolve, reject) => {
  abcxxx()
});
```

 这种情况无论是onerror还是监听错误事件都是无法捕获的 。

 ```javascript
new Promise((resolve, reject) => {
  error()
})
// 增加异常捕获
  .catch((err) => {
  console.log('promise catch:',err)
});
 ```

 除非每个Promise都添加一个catch方法。但是显然是不能这样做。 

```javascript
window.addEventListener("unhandledrejection", e => {
  console.log('unhandledrejection',e)
});
```

![](./images/unhander.png)

 我们可以考虑将unhandledrejection事件捕获错误抛出交由错误事件统一处理就可以了 。

```javascript
window.addEventListener("unhandledrejection", e => {
  throw e.reason
});
```

##### async/await异常捕获

```javascript
const asyncFunc = () => new Promise(resolve => {
  error
})
setTimeout(async() => {
  try {
    await asyncFun()
  } catch (e) {
    console.log('catch:',e)
  }
})
```

 实际上async/await语法本质还是Promise语法。区别就是async方法可以被上层的try/catch捕获。 

![](./images/async.png)

 如果不去捕获的话就会和Promise一样，需要用unhandledrejection事件捕获。这样的话我们只需要在全局增加unhandlerejection就好了。 

![](./images/async2.png)

##### 小结

| 异常类型                   | 同步方法 | 异步方法 | 资源加载 | Promise | async/await |
| -------------------------- | -------- | -------- | -------- | ------- | ----------- |
| try/catch                  | √        |          |          |         | √           |
| onerror                    | √        | √        |          |         |             |
| error事件监听              | √        | √        | √        |         |             |
| unhandledrejection事件监听 |          |          |          | √       | √           |

 实际上我们可以将unhandledrejection事件抛出的异常再次抛出就可以统一通过error事件进行处理了。 

 最终用代码表示如下： 

```javascript
window.addEventListener("unhandledrejection", e => {
  throw e.reason
});
window.addEventListener('error', args => {
  console.log(
    'error event:', args
  );
  return true;
}, true);
```

#### webpack工程化

 现在是前端工程化的时代,工程化导出的代码一般都是被压缩混淆后的。 

比如：

```javascript
setTimeout(() => {
    xxx(1223)
}, 1000)
```

![](./images/webpack.png)

 出错的代码指向被压缩后的JS文件，而JS文件长下图这个样子。 

![](./images/webpackjs.png)

 如果想将错误和原有的代码关联起来就需要sourcemap文件的帮忙了。 

##### sourceMap是什么

简单说，`sourceMap`就是一个文件，里面储存着位置信息。

仔细点说，这个文件里保存的，是转换后代码的位置，和对应的转换前的位置。

那么如何利用sourceMap对还原异常代码发生的位置这个问题我们到异常分析这个章节再讲。

具体怎么在webpack配置sourcemap，以及sourcemap有哪些格式，可以参考[这篇文章](https://blog.csdn.net/DengZY926/article/details/106123735)。

#### Vue错误收集

 为了测试的需要我们暂时关闭eslint 这里面还是建议大家全程打开eslint 

 在vue.config.js进行配置 

```javascript
module.exports = {   
  // 关闭eslint规则
  devServer: {
    overlay: {
      warnings: true,
      errors: true
    }
  },
  lintOnSave:false
}
```

 我们故意在src/components/HelloWorld.vue 

```
<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  mounted() {
    // 制造一个错误
    abc()
  }
};
</script>
​```html

然后在src/main.js中添加错误事件监听

​```js
window.addEventListener('error', args => {
  console.log('error', error)
})
```

 这个时候 错误会在控制台中被打印出来,但是错误事件并没有监听到。 

![](./images/vue.png)

##### handleError

 为了对Vue发生的异常进行统一的上报，需要利用vue提供的handleError句柄。一旦Vue发生异常都会调用这个方法。 

 我们在src/main.js 

```vue
Vue.config.errorHandler = function (err, vm, info) {
  console.log('errorHandle:', err)
}
```

 运行结果结果： 

![](./images/vue2.png)

#### vue3.0

新建vue3.0模板的工程，发现不用通过handleError句柄，直接通过error事件监听。

![](./images/vue3.0.png)

### 错误上报

#### 上报方式

##### 动态创建img标签

 上报就是要将捕获的异常信息发送到后端。最常用的方式首推动态创建标签方式。因为这种方式无需加载任何通讯库，而且页面是无需刷新的。基本上目前包括百度统计 Google统计都是基于这个原理做的埋点。 

```javascript
new Image().src = 'http://localhost:7001/monitor/error'+ '?info=xxxxxx'
```

![](./images/img.png)

 通过动态创建一个img标签,浏览器就会向服务器发送get请求。可以把你需要上报的错误数据放在querystring字符串中，利用这种方式就可以将错误上报到服务器了。 

##### Ajax上报

 实际上我们也可以用ajax的方式上报错误，这和我们再业务程序中并没有什么区别。在这里就不赘述。 

#### 上报哪些数据

![](./images/error.png)

我们来看下error事件参数：



### 打包上传sourcemap



### 记录日志



### 错误还原







