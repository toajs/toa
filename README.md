# Toa

简洁而强大的 web 框架。

![Toa](https://raw.githubusercontent.com/toajs/toa/master/toa.png)

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![js-standard-style][js-standard-image]][js-standard-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

## Thanks to [Koa](https://github.com/koajs/koa) and it's authors

## Demo

```js
const ilog = require('ilog')
const Toa = require('toa')

const app = new Toa()

app.use(function () {
  this.body = 'support sync function middleware!\n'
})

app.use(function (next) {
  this.body += 'support thunk function middleware!\n'
  next()
})

app.use(function * () {
  this.body += yield Promise.resolve('support generator function middleware!\n')
})
// support in Node.js v8
app.use(async function () {
  this.body += await Promise.resolve('support async/await function middleware!\n')
})

app.listen(3000, () => ilog.info('App start at: 3000'))
```

## TypeScript Demo

```typescript
import { Toa } from 'toa'

const app = new Toa()

app.use(function () {
  this.body = 'support sync function middleware!\n'
})

app.use(function (next) {
  this.body += 'support thunk function middleware!\n'
  next()
})

app.use(function * () {
  this.body += yield Promise.resolve('support generator function middleware!\n')
})

app.use(async function () {
  this.body += await Promise.resolve('support async/await function middleware!\n')
})

app.listen(3000, () => console.log('App start at 3000'))
```

## With HTTP/2

```js
// Visit: https://127.0.0.1:3000/
const http2 = require('http2')
const fs = require('fs')
const Toa = require('toa')
const server = http2.createServer({
  key: fs.readFileSync('./localhost.key'),
  cert: fs.readFileSync('./localhost.crt')
})

const app = new Toa(server)
app.use(function () {
  this.body = 'Hello World!\n-- toa'
})

app.listen(3000, () => console.log('https://127.0.0.1:3000/'))
```

## Install

```sh
npm install toa
```

## Toa 简介

**Toa** 是 **Koa** 的改进版。

**Toa** 修改自 **Koa**，基本架构原理与 **Koa** 相似，`context`、`request`、`response` 三大基础对象几乎一样。但 **Toa** 是基于 [thunks](https://github.com/thunks/thunks) 组合业务逻辑，来实现异步流程控制和异常处理。

**Toa** 的异步核心是 `thunk` 函数，支持 `node.js v0.10.x`，但在支持 generator 的 node 环境中（io.js, node.js >= v0.11.9）将会有更好地编程体验：**用同步逻辑编写非阻塞的异步程序**。

**Toa** 与 **Koa** 学习成本和编程体验是一致的，两者之间几乎是无缝切换。但 **Toa** 去掉了 **Koa** 的 `级联（Cascading）` 逻辑，强化中间件，强化模块化组件，尽量削弱第三方组件访问应用的能力，使得编写大型应用的结构逻辑更简洁明了，也更安全。

### koa Process

![koa Process](https://raw.githubusercontent.com/toajs/toa/master/doc/process_koa.png)

### Toa Process

![Toa Process](https://raw.githubusercontent.com/toajs/toa/master/doc/process_toa.png)

## 功能模块

与 Koa 一样， Toa 也没有绑定多余的功能，而仅仅提供了一个轻量优雅的函数库，异步控制处理器和强大的扩展能力。

使用者可以根据自己的需求选择独立的功能模块或中间件，或自己实现相关功能模块。以下是 Toajs 提供的基础性的功能模块。它们已能满足大多数的应用需求。

- [toa-pm](https://github.com/toajs/toa-pm) Process events manager for toa.
- [toa-ejs](https://github.com/toajs/toa-ejs) Ejs render module for toa.
- [toa-cors](https://github.com/toajs/toa-cors) CORS middleware for Toa.
- [toa-mejs](https://github.com/toajs/toa-mejs) Mejs render module for toa.
- [toa-i18n](https://github.com/toajs/toa-i18n) I18n middleware for toa.
- [toa-body](https://github.com/toajs/toa-body) Request body parser for toa.
- [toa-token](https://github.com/toajs/toa-token) Token based authentication for toa.
- [toa-router](https://github.com/toajs/toa-router) A trie router for toa.
- [toa-static](https://github.com/toajs/toa-static) A static server module for toa.
- [toa-morgan](https://github.com/toajs/toa-morgan) HTTP request logger middleware for Toa.
- [toa-favicon](https://github.com/toajs/toa-favicon) Favicon middleware for toa.
- [toa-session](https://github.com/toajs/toa-session) Session middleware for toa.
- [toa-compress](https://github.com/toajs/toa-compress) Compress responses middleware for toa.
- [toa-ratelimit](https://github.com/toajs/toa-ratelimit) Smart rate limiter module for toa.
- [toa-cookie-session](https://github.com/toajs/toa-cookie-session) Cookie session middleware for toa.

------

## [Bench](https://github.com/toajs/toa/tree/master/bench)

## API

### [使用手册](https://github.com/toajs/toa/blob/master/doc/guide.md)

### [Application](https://github.com/toajs/toa/blob/master/doc/api/application.md)

### [Context](https://github.com/toajs/toa/blob/master/doc/api/context.md)

### [Request](https://github.com/toajs/toa/blob/master/doc/api/request.md)

### [Response](https://github.com/toajs/toa/blob/master/doc/api/response.md)

## [Change Log](https://github.com/toajs/toa/blob/master/CHANGELOG.md)

[npm-url]: https://npmjs.org/package/toa
[npm-image]: http://img.shields.io/npm/v/toa.svg

[travis-url]: https://travis-ci.org/toajs/toa
[travis-image]: http://img.shields.io/travis/toajs/toa.svg

[coveralls-url]: https://coveralls.io/r/toajs/toa
[coveralls-image]: https://coveralls.io/repos/toajs/toa/badge.svg

[downloads-url]: https://npmjs.org/package/toa
[downloads-image]: http://img.shields.io/npm/dm/toa.svg?style=flat-square

[js-standard-url]: https://github.com/feross/standard
[js-standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
