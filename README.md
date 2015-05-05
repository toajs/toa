Toa
====
简洁而强大的 web 框架。

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Talk topic][talk-image]][talk-url]

### Thanks to [Koa](https://github.com/koajs/koa) and it's authors

### Toa 简介

**Toa** 修改自 **Koa**，基本架构原理与 **Koa** 相似，`context`、`request`、`response` 三大基础对象几乎一样。但 **Toa** 是基于 [thunks](https://github.com/thunks/thunks) 组合业务逻辑，来实现异步流程控制和异常处理。`thunks` 是一个比 `co` 更强大，性能更好的异步流程控制工具。

**Toa** 的异步核心是 `thunk` 函数，故而支持 `node.js v0.10.x`，但在支持 generator 的 node 环境中（io.js, node.js >= v0.11.9）将会有更好地编程体验：**用同步逻辑编写非阻塞的异步程序**。

**Toa** 与 **Koa** 学习成本和编程体验是一致的，两者之间几乎是无缝切换。但 **Toa** 去掉了 **Koa** 的 `级联（Cascading）` 逻辑，弱化中间件，强化模块化组件，尽量削弱第三方组件访问应用的能力，使得编写大型应用的结构逻辑更简洁明了，也更安全。

### 功能模块
与 Koa 一样， Toa 也没有绑定过多的功能，而仅仅提供了一个轻量优雅的函数库，和强大的扩展能力。

使用者可以根据自己的需求选择独立的功能模块或中间件，或自己实现相关功能模块。以下是 Toajs 提供的基础性的功能模块。它们已能满足大多数的应用需求。

- [toa-ejs](https://github.com/toajs/toa-ejs) Ejs render module for toa.
- [toa-ejs](https://github.com/toajs/toa-mejs) Mejs render module for toa.
- [toa-i18n](https://github.com/toajs/toa-i18n) I18n middleware for toa.
- [toa-body](https://github.com/toajs/toa-body) Request body parser for toa.
- [toa-token](https://github.com/toajs/toa-token) Token based authentication for toa.
- [toa-router](https://github.com/toajs/toa-router) A router for toa.
- [toa-static](https://github.com/toajs/toa-static) A static server module for toa.
- [toa-favicon](https://github.com/toajs/toa-favicon) Favicon middleware for toa.
- [toa-session](https://github.com/toajs/toa-session) Session middleware for toa.
- [toa-compress](https://github.com/toajs/toa-compress) Compress responses middleware for toa.

### 安装 Toa

````
npm install toa
````

### Demo

```js
var Toa = require('toa');
var app = Toa(function() {
  this.body = 'Hello World!\n-- toa';
});

app.listen(3000);
```
------

## API

```js
var Toa = require('toa');
```

### Class: Toa([server][, appBody][, options])

- `server`: {Object}, 可以是 http server 或 https server。
- `appBody`: {Function} 有唯一参数 `Thunk`，它的作用域带有 `onerror` 监听，能捕获任何异常。`appBody` 中如果有异步逻辑，则应该封装在 `thunk` 函数、 `generator` 函数、`generator` 对象或`promise` 对象等中并 `return` 返回（与 `thunks` 或 `Promise` 类似）。
- `options`: {Object} 同 `thunks` 的 options，可以定义 `appBody` 中 `Thunk` 作用域的 `debug` 方法和 `onerror` 方法。其中 `onerror` 方法可用于对捕获异常进行初步加工处理，再 `return` 或 `throw` 给 Toa 内置的 `onResError` 处理。如果 `onerror` 返回 `true`，则忽略该异常，继续执行后续业务逻辑。

```js
// with full arguments
var app = new Toa(server, function(Thunk) {
  // body...
}, {
  debug: function() {}
  onerror: function(error) {}
});
```

### [Context](https://github.com/toajs/toa/blob/master/docs/api/context.md)
### [Request](https://github.com/toajs/toa/blob/master/docs/api/request.md)
### [Response](https://github.com/toajs/toa/blob/master/docs/api/response.md)

#### app.keys = ['key1', 'key2']

设置 cookie 加密密钥，参考 [Keygrip](https://github.com/expressjs/keygrip)。

#### app.config = config

config 会被 `context.config` 继承，但 `context.config` 不会修改 `app.config`。

```js
app.config = config;
```

默认值：
```js
{
  proxy: false,
  env: process.env.NODE_ENV || 'development',
  subdomainOffset: 2,
  poweredBy: 'Toa'
}
```

#### app.use(function(callback) {})
#### app.use(function*() {})

加载中间件，返回 `app`，`fn` 必须是 `thunk` 函数或 `generator` 函数，函数中的 `this` 值为 `context`。

```js
app.use(function (callback) {
  // task
  // this === context
  callback(err, result);
})
```

```js
app.use(function* () {
  // task
  // this === context
  yield result;
})
```

#### app.onerror = function(error) {}

设置 `onerror` 函数，当 app 捕捉到程序运行期间的错误时，会先使用 `options.onerror`（若提供）处理，再使用内置的 `onResError` 函数处理响应给客户端，最后抛出给 `app.onerror` 处理，应用通常可以在这里判断错误类型，根据情况将错误写入日志系统。

```js
// default
app.onerror = function(err) {
  // ignore null and response error
  if (err == null || (err.status && err.status < 500)) return;
  if (!util.isError(err)) err = new Error('non-error thrown: ' + err);

  // catch system error
  var msg = err.stack || err.toString();
  console.error(msg.replace(/^/gm, '  '));
};
```

#### app.onmessage = function(message) {}

设置 `onmessage` 函数，该函数接受 `process` 的 `message` 通知，主要目的是用来处理 `pm2 gracefulReload`，也可以自己定义其行为。

```js
// default
app.onmessage = function(msg) {
  if (msg === 'shutdown') {
    this.server.close(function() {
      process.exit(0);
    });
  }
};
```

#### app.listen(port, [hostname], [backlog], [callback])
#### app.listen(path, [callback])
#### app.listen(handle, [callback])

返回 `server`，用法与 `httpServer.listen` 一致。

```js
// 与 httpServer.listen 一致
app.listen(3000);
```

[npm-url]: https://npmjs.org/package/toa
[npm-image]: http://img.shields.io/npm/v/toa.svg

[travis-url]: https://travis-ci.org/toajs/toa
[travis-image]: http://img.shields.io/travis/toajs/toa.svg

[talk-url]: https://guest.talk.ai/rooms/a6a9331024
[talk-image]: https://img.shields.io/talk/t/a6a9331024.svg
