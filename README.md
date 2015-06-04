Toa
====
简洁而强大的 web 框架。

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![js-standard-style][js-standard-image]][js-standard-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]
[![Talk topic][talk-image]][talk-url]

## Thanks to [Koa](https://github.com/koajs/koa) and it's authors

## Toa 简介

**Toa** 修改自 **Koa**，基本架构原理与 **Koa** 相似，`context`、`request`、`response` 三大基础对象几乎一样。但 **Toa** 是基于 [thunks](https://github.com/thunks/thunks) 组合业务逻辑，来实现异步流程控制和异常处理。`thunks` 是一个比 `co` 更强大的异步流程控制工具。

**Toa** 的异步核心是 `thunk` 函数，支持 `node.js v0.10.x`，但在支持 generator 的 node 环境中（io.js, node.js >= v0.11.9）将会有更好地编程体验：**用同步逻辑编写非阻塞的异步程序**。

**Toa** 与 **Koa** 学习成本和编程体验是一致的，两者之间几乎是无缝切换。但 **Toa** 去掉了 **Koa** 的 `级联（Cascading）` 逻辑，弱化中间件，强化模块化组件，尽量削弱第三方组件访问应用的能力，使得编写大型应用的结构逻辑更简洁明了，也更安全。

## 功能模块
与 Koa 一样， Toa 也没有绑定过多的功能，而仅仅提供了一个轻量优雅的函数库，和强大的扩展能力。

使用者可以根据自己的需求选择独立的功能模块或中间件，或自己实现相关功能模块。以下是 Toajs 提供的基础性的功能模块。它们已能满足大多数的应用需求。

- [toa-pm](https://github.com/toajs/toa-pm) Process events manager for toa.
- [toa-ejs](https://github.com/toajs/toa-ejs) Ejs render module for toa.
- [toa-mejs](https://github.com/toajs/toa-mejs) Mejs render module for toa.
- [toa-i18n](https://github.com/toajs/toa-i18n) I18n middleware for toa.
- [toa-body](https://github.com/toajs/toa-body) Request body parser for toa.
- [toa-token](https://github.com/toajs/toa-token) Token based authentication for toa.
- [toa-router](https://github.com/toajs/toa-router) A router for toa.
- [toa-static](https://github.com/toajs/toa-static) A static server module for toa.
- [toa-favicon](https://github.com/toajs/toa-favicon) Favicon middleware for toa.
- [toa-session](https://github.com/toajs/toa-session) Session middleware for toa.
- [toa-compress](https://github.com/toajs/toa-compress) Compress responses middleware for toa.

## 安装 Toa

````
npm install toa
````

## Demo

```js
var Toa = require('toa')
var app = Toa(function () {
  this.body = 'Hello World!\n-- toa'
})

app.listen(3000)
```
------

## API

### [使用手册](https://github.com/toajs/toa/blob/master/docs/guide.md)
### [Context](https://github.com/toajs/toa/blob/master/docs/api/context.md)
### [Request](https://github.com/toajs/toa/blob/master/docs/api/request.md)
### [Response](https://github.com/toajs/toa/blob/master/docs/api/response.md)

## Who's using

### [Teambition](https://www.teambition.com/)
1. Teambition 用户社区 https://bbs.teambition.com/
2. Teambition 文件服务 https://striker.teambition.net/
3. Teambition 消息服务 https://push.teambition.com/

如果你也在用，不妨告知我~

[npm-url]: https://npmjs.org/package/toa
[npm-image]: http://img.shields.io/npm/v/toa.svg

[travis-url]: https://travis-ci.org/toajs/toa
[travis-image]: http://img.shields.io/travis/toajs/toa.svg

[coveralls-url]: https://coveralls.io/r/toajs/toa
[coveralls-image]: https://coveralls.io/repos/toajs/toa/badge.svg

[downloads-url]: https://npmjs.org/package/toa
[downloads-image]: http://img.shields.io/npm/dm/toa.svg?style=flat-square

[talk-url]: https://guest.talk.ai/rooms/a6a9331024
[talk-image]: https://img.shields.io/talk/t/a6a9331024.svg

[js-standard-url]: https://github.com/feross/standard
[js-standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
