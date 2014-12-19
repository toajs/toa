Toa v0.5.3 [![Build Status](https://travis-ci.org/toajs/toa.svg)](https://travis-ci.org/toajs/toa)
====
基于 Thunks 打造的网页服务框架，修改自 [Koa](https://github.com/koajs/koa) 框架。[Thunks](https://github.com/thunks/thunks) 是一个异步编程框架。

## 说明（感谢 koa 的贡献者）

Toa 继承了 Koa 的 `context`、`request`、`response` ，但有以下区别：

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

## Demo

不使用 generator ，可兼容 node.js v0.10.x：

```js
var Toa = require('toa');
var app = Toa(function (Thunk) {
  this.body = 'Hello World!\n-- toa';
});

app.listen(3000);
```

使用 generator:

```js
var Toa = require('toa');
var app = Toa(function* (Thunk) {
  this.body = yield 'Hello World!\n-- ' + this.config.poweredBy;
});

app.config = {
  poweredBy: 'Test'
};

app.listen(3000);
```

使用中间件：

```js
var Toa = require('toa');
var app = Toa();

app.use(function* () {
  this.body = yield 'Hello World!\n-- toa';
});

app.listen(3000);
```

使用自定义 server：

```js
var https = require('https');
var fs = require('fs');
var Toa = require('toa');

var options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};

var server = https.createServer(options);


var app = Toa(server, function (Thunk) {
  this.body = 'Hello World!\n-- toa';
});

app.listen(3000);
```

文件服务：

```js
var fs = require('fs');
var Toa = require('toa');
var app = Toa(function (Thunk) {
  this.type = 'text';
  this.body = fs.createReadStream(__dirname + '/simple.js', {encoding: 'utf8'});
});

app.listen(3000);
```

## Installation

`npm install toa`

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
