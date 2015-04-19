Toa
====
简洁而强大的 web 框架。

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Talk topic][talk-image]][talk-url]

### Toa 简介

Toa 修改自 [Koa](https://github.com/koajs/koa)，基本架构原理与 Koa 相似，`context`、`request`、`response` 三大基础对象几乎一样。但 Toa 是基于 [thunks](https://github.com/thunks/thunks) 组合业务逻辑，实现了完美的异步编程控制和异常处理。

Toa 的异步核心是 `thunk` 函数，故而支持 `node.js v0.10.x`，但在支持 generator 的 node 环境中（io.js, node.js >= v0.11.9）将会有更好地编程体验：**用同步逻辑编写非阻塞的异步程序**。

Toa 与 Koa 学习成本和编程体验是一致的，两者之间几乎是无缝切换。但 Toa 去掉了 Koa 的 `级联（Cascading）` 逻辑，弱化中间件，强化模块化组件，加强了对 `流（stream）` 的异步支持，使得编写大型应用的结构逻辑更简洁明了，也更安全。

### 功能模块
与 Koa 一样， Toa 也没有绑定过多的功能，而仅仅提供了一个轻量优雅的函数库，和强大的扩展能力。

使用者可以根据自己的需求选择独立的功能模块或中间件，或自己实现相关功能模块。以下是 Toa 社区已提供的基础性的功能模块。它们已能满足大多数的应用需求。

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

---

## API

```js
var Toa = require('toa');
```

### Class: Toa([server], [appBody], [options])

- `server` 可以是 http server 或 https server。
- `appBody` 有唯一参数 `Thunk`，它的作用域带有 `onerror` 监听，能捕获任何异常。`appBody` 中如果有异步逻辑，则应该封装在 `thunk` 函数、 `generator` 函数、`generator` 对象或`promise` 对象等中并 `return` 返回（与 `thunks` 或 `Promise` 类似）。
- `options` 同 thunks 的 options，可以定义 `appBody` 中 `Thunk` 作用域的 `debug` 方法和 `onerror` 方法。其中 `onerror` 方法可用于对捕获异常进行初步加工处理，再 `return` 或 `throw` 给 Toa 内置的 `onResError` 处理。如果 `onerror` 返回 `true`，则忽略该异常，继续执行后续业务逻辑。

```js
var app = new Toa(server, function (Thunk) {
  // body...
}, {
  debug: function () {}
  onerror: function (error) {}
});
```
### context, request, response

中文文档可参考 http://koajs.cn/ ，或者直接阅读 toa 源码。中间件函数、appBody 函数和 appBody 的 `Thunk` 派生的 `thunk` 函数，其 `this` 值均为 `context`。如：

```js
this.req // node.js 原生 request stream
this.request // toa 封装后的 request stream
this.res // node.js 原生 response stream
this.response // toa 封装后的 request stream
this.cookies
this.throw
this.on
this.emit
// ...
```

### app.keys = ['key1', 'key2']

用于 cookie 加密的 [Keygrip](https://github.com/expressjs/keygrip) 对象或数组。

### app.config = config

config 会被 `context` 继承，但 `context` 不能修改 `app.config`。

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

### app.use(function (callback) {})
### app.use(function* () {})

返回 `app`，`fn` 必须是 `thunk` 函数或 `generator` 函数，函数中的 `this` 值为 `context`。

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

### app.onerror = function (error) {}

```js
app.onerror = function (error) {
  // task
})
```

### app.listen(port, [hostname], [backlog], [callback])
### app.listen(path, [callback])
### app.listen(handle, [callback])

返回 `server`，用法与 `httpServer.listen` 一致。

```js
// 与 httpServer.listen 一致
app.listen(3000);
```

Toa 相对于 Koa，主要有以下区别：

1. Toa 基于 `thunks` 组织业务逻辑，支持 `node.js v0.10.x`;
2. Toa 弱化中间件，也可以使用类似 koa 的中间件，但不支持**级联**( `yield* next` )，因为我认为级联与回调地狱类似，容易导致逻辑混乱；
3. Toa 提倡使用 `thunks` 进行模块化开发，即一个模块接受输入，返回 `thunk`；
4. 为安全起见，`context`、`request`、`response` 不包含 `app` 属性，即业务逻辑或模块无法访问顶层 `app` 对象；
5. `app` 不是 `Event` 对象，`context` 变成了 `Event` 对象，方便业务逻辑内部用事件通信；
6. `app` 和 `context` 增加 `config` 属性，`app` 可设置 config，业务逻辑可访问 config；
7. Toa 已嵌入异常处理逻辑，只需像 `thunks` 一样处理或抛出异常即可（请参考 [thunks 的作用域和异常处理设计](https://github.com/thunks/thunks/blob/master/docs/scope-and-error-catch.md)），无需再使用 node.js 的 `domain` 系统。异常分两个层次：
    1. 第一层是用户请求异常，业务逻辑可生成对应的错误信息，用 `this.throw(error)` 抛出或直接 `throw` 抛出即可，Toa会自动将其响应给用户；
    2. 第二层是系统异常，如业务逻辑抛出错误等，Toa也能自动捕获，对用户响应 `500` 错误，并把异常交给 `app.onerror` 处理。

对于异步业务，应尽量用 `thunks` 封装才能捕获异常，如果确实不能用 `thunks` 封装，也可使用 `context.emit('error', error)`抛给应用处理。

## Who's using

+ Teambition community: https://bbs.teambition.com/

[npm-url]: https://npmjs.org/package/toa
[npm-image]: http://img.shields.io/npm/v/toa.svg

[travis-url]: https://travis-ci.org/toajs/toa
[travis-image]: http://img.shields.io/travis/toajs/toa.svg

[talk-url]: https://guest.talk.ai/rooms/a6a9331024
[talk-image]: https://img.shields.io/talk/t/a6a9331024.svg
