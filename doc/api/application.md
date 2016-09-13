Toa
====
简洁而强大的 web 框架。

## Thanks to [Koa](https://github.com/koajs/koa) and it's authors

## Summary

- [Toa 简介](#toa)
- [Application 应用](#application)
- [Context 对象](#context)
- [Request 对象](#request)
- [Response 对象](#response)

## Toa

__Toa__ 修改自 __Koa__，基本架构原理与 __Koa__ 相似，`context`、`request`、`response` 三大基础对象几乎一样。但 __Toa__ 是基于 [thunks](https://github.com/thunks/thunks) 组合业务逻辑，来实现异步流程控制和异常处理。`thunks` 是一个比 `co` 更强大的异步流程控制工具。

__Toa__ 的异步核心是 `thunk` 函数，支持 `node.js v0.10.x`，但在支持 generator 的 node 环境中（io.js, node.js >= v0.11.9）将会有更好地编程体验：**用同步逻辑编写非阻塞的异步程序**。

__Toa__ 与 __Koa__ 学习成本和编程体验是一致的，两者之间几乎是无缝切换。但 __Toa__ 去掉了 __Koa__ 的 `级联（Cascading）` 逻辑，强化中间件，强化模块化组件，尽量削弱第三方组件访问应用的能力，
使得编写大型应用的结构逻辑更简洁明了，也更安全。

### 安装 Toa

````
npm install toa
````

------

## Application

一个 Toa Application（以下简称 __app__）由一系列 __中间件__ 和 __模块__ 组成。__中间件__ 是指通过 `app.use` 加载的 thunk 函数或 generator 函数。__模块__ 特指在实例化 Toa 时的 `mainFn` 中的功能组件。

这些功能组件可能是同步或异步的函数，它们的运行参数可以完全由应用开发者控制，它们对应用的访问权限可以变得极小。
这里与 Koa 的强调中间件概念有较大区别：中间件总能访问到 `context` 对象，而 Koa 的 `context` 又包含了 `app` 自身的引用。也就是说中间件能访问应用的一切资源。

对于 web server 的一次访问请求，app 会按照顺序先运行中间件，然后再运行 `mainFn` 中的模块组，最后运行内置的 `respond` 函数，将请求结果自动响应的客户端。由于 Toa 没有 `级联（Cascading）`，这些中间件或模块的运行不会有任何交叉，它们总是先运行完一个，再运行下一个。

Toa 只有一个极简的内核，提供快捷的 HTTP 操作和异步流程控制能力。具体的业务功能逻辑则由中间件和模块组合实现。
用户则可根据自己的业务需求，以最轻量级的方式组合自己的应用。

让我们来看看 Toa 极其简单的 Hello World 应用程序：

```js
var Toa = require('toa')
var app = Toa(function () {
  this.body = 'Hello World!\n-- toa'
})

app.listen(3000)
```

### Class: Toa([server][, mainFn][, options])

- `server`: {Object}, http server 或 https server 实例。
- `mainFn`: {Function} `mainFn` 中如果有异步逻辑，则应该封装成 `thunk` 处理器能处理的对象（thunkable value），如 `generator` 函数、`generator` 对象、thunk 函数或`promise` 对象等，并 `return` 返回（与 `thunks` 或 `Promise` 类似）。
- `options`: {Object} 类似 `thunks` 的 options，对于 server 的每一个 **client request**，toa app 均会用 `thunks` 生成一个的 `thunk`，挂载到 `context.thunk`，该 `thunk` 的作用域对该 **client request** 的整个生命周期生效。
  - `options.onerror`: {Function} 其 `this` 为 **client request** 的 `context` 对象。当 **client request** 处理流程出现异常时，会抛出到 `onerror`，原有处理流程会终止，`onerror` 运行完毕后再进入 toa 内置的异常处理流程，最后 `respond` 客户端。如果 `onerror` 返回 `true`，则会忽略该异常，异常不会进入内置异常处理流程，然后直接 `respond` 客户端。
```js
// with full arguments
var app = new Toa(server, function () {
  // body...
}, {
  onerror: function (error) {}
})
```

#### app.keys = ['key1', 'key2']

设置 cookie 签名密钥，参考 [Keygrip](https://github.com/expressjs/keygrip)。
注意，签名密钥只在配置项 `signed` 参数为真时才会生效：

````js
this.cookies.set('name', 'test', {signed: true})
````

#### app.config = config

config 会被 `context.config` 继承，但 `context.config` 不会修改 `app.config`。

```js
app.config = config
```

app.config 默认值：
```js
{
  proxy: false, // 决定了哪些 `proxy header` 参数会被加到信任列表中
  env: process.env.NODE_ENV || 'development', // node 执行环境
  subdomainOffset: 2,
  poweredBy: 'Toa'
}
```

#### app.use(function () {})
#### app.use(function (callback) {})
#### app.use(function * () {})
#### app.use(async function () {})

加载中间件，返回 `app`，`fn` 必须是 `thunk` 函数或 `generator` 函数，函数中的 `this` 值为 `context`。

```js
app.use(function (callback) {
  // task
  // this === context
  callback(err, result)
})
```

```js
app.use(function * () {
  // task
  // this === context
  yield result
})
```

#### app.onerror = function (error) {}

设置 `onerror` 函数，当 app 捕捉到程序运行期间的错误时，会先使用 `options.onerror`（若提供）处理，再使用内置的 `onResError` 函数处理响应给客户端，最后抛出给 `app.onerror` 处理，应用通常可以在这里判断错误类型，根据情况将错误写入日志系统。

```js
// default
app.onerror = function (err) {
  // ignore null and response error
  if (err == null || (err.status && err.status < 500)) return
  if (!util.isError(err)) err = new Error('non-error thrown: ' + err)

  // catch system error
  var msg = err.stack || err.toString()
  console.error(msg.replace(/^/gm, '  '))
}
```


#### app.toListener()

返回 app request listener。

```js
var http = require('http')
var toa = require('toa')

var app = toa()

var server = http.createServer(app.toListener())
server.listen(3000)
```

等效于：
```js
var toa = require('toa')

var app = toa()
app.listen(3000)
```

#### app.listen(port, [hostname], [backlog], [callback])
#### app.listen(path, [callback])
#### app.listen(handle, [callback])

返回 `server`，用法与 `httpServer.listen` 一致。

```js
// 与 httpServer.listen 一致
app.listen(3000)
```
