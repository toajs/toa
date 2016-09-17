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


------

## Context
> Similar to [Koa's Context](https://github.com/koajs/koa/blob/master/docs/api/context.md)

### Difference from Koa:

- remove `ctx.app`
- add `ctx.thunk` method, it is thunk function that bound a scope with `onerror`.
- add `ctx.end` method, use to stopping request process and respond immediately.
- add `ctx.after` method, use to add hooks that run after middlewares and before respond.
- add `ctx.catchStream` method, used to catch stream's error or clean stream when some error.
- add `ctx.ended` property, indicates that the response ended.
- add `ctx.finished` property, indicates that the response finished successfully.
- add `ctx.closed` property, indicates that the response closed unexpectedly.
- context is a `EventEmitter` instance

`Context` object encapsulates node's `request` and `response` objects into a single object which provides many helpful methods for writing web applications and APIs. These operations are used so frequently in HTTP server development that they are added at this level instead of a higher level framework, which would force middleware to re-implement this common functionality.

A `Context` is created _per_ request, and is referenced in middleware as the receiver, or the `this` identifier, as shown in the following snippet:

```js
var app = Toa(function * () {
  this // is the Context
  this.request // is a toa Request
  this.response // is a toa Response
})

app.use(function * () {
  this // is the Context
  this.request // is a toa Request
  this.response // is a toa Response
})
```

Many of the context's accessors and methods simply delegate to their `ctx.request` or `ctx.response` equivalents for convenience, and are otherwise identical. For example `ctx.type` and `ctx.length` delegate to the `response` object, and `ctx.path` and `ctx.method` delegate to the `request`.

### Events

#### 'close'
Emitted after a HTTP request closed, indicates that the socket has been closed, and `context.closed` will be `true`.

#### 'end'
Emitted after respond() was called, indicates that body was sent. and `context.ended` will be `true`

#### 'finish'
Emitted after a HTTP response finished. and `context.finished` will be `true`.

#### 'error'
A context always listen `'error'` event by `ctx.onerror`. `ctx.onerror` is a **immutable** error handle. So you can use `ctx.emit('error', error)` to deal with your exception or error.

### API

`Context` specific methods and accessors.

#### ctx.thunk([thunkable])

A thunk function that bound a scope.

- `thunkable` thunkable value, see: https://github.com/thunks/thunks

#### ctx.end([message])

Use to stopping request process and respond immediately. **It should not run in `try catch` block, otherwise `onstop` will not be trigger**.

- `message` String, see: https://github.com/thunks/thunks

#### ctx.after(function () {})
#### ctx.after(function (callback) {})
#### ctx.after(function * () {})
#### ctx.after(async function () {})

Add hooks dynamicly. Hooks will run after middlewares and mainFn, but before `respond`.

#### ctx.req

Node's `request` object.

#### ctx.res

Node's `response` object.

Bypassing Toa's response handling is __not supported__. Avoid using the following node properties:

- `res.statusCode`
- `res.writeHead()`
- `res.write()`
- `res.end()`

#### ctx.request

A Toa `Request` object.

#### ctx.response

A Toa `Response` object.

#### ctx.state

The recommended namespace for passing information through middleware and to your frontend views.

```js
this.state.user = yield User.find(id)
```

#### ctx.cookies.get(name, [options])

Get cookie `name` with `options`:

- `signed` the cookie requested should be signed

Toa uses the [cookies](https://github.com/jed/cookies) module where options are simply passed.

#### ctx.cookies.set(name, value, [options])

Set cookie `name` to `value` with `options`:

- `signed` sign the cookie value
- `expires` a `Date` for cookie expiration
- `path` cookie path, `/'` by default
- `domain` cookie domain
- `secure` secure cookie
- `httpOnly` server-accessible cookie, __true__ by default

Toa uses the [cookies](https://github.com/jed/cookies) module where options are simply passed.

#### ctx.throw([msg], [status], [properties])

Helper method to throw an error with a `.status` property defaulting to `500` that will allow Toa to respond appropriately. The following combinations are allowed:

```js
this.throw(403)
this.throw('name required', 400)
this.throw(400, 'name required')
this.throw('something exploded')
```

For example `this.throw('name required', 400)` is equivalent to:

```js
var err = new Error('name required')
err.status = 400
throw err
```

Note that these are user-level errors and are flagged with `err.expose` meaning the messages are appropriate for client responses, which is typically not the case for error messages since you do not want to leak failure details.

You may optionally pass a `properties` object which is merged into the error as-is, useful for decorating machine-friendly errors which are reported to the requester upstream.

```js
this.throw(401, 'access_denied', {user: user})
this.throw('access_denied', {user: user})
```

Toa uses [http-errors](https://github.com/jshttp/http-errors) to create errors.

#### ctx.createError([status], [msg], [properties])

Similar to `ctx.throw`, create a error object, but don't throw.

#### ctx.assert(value, [status], [msg], [properties])

Helper method to throw an error similar to `.throw()` when `!value`. Similar to node's [assert()](http://nodejs.org/api/assert.html) method.

```js
this.assert(this.state.user, 401, 'User not found. Please login!')
```

Toa uses [http-assert](https://github.com/jshttp/http-assert) for assertions.

#### ctx.respond

To bypass Toa's built-in response handling, you may explicitly set `this.respond = false`. Use this if you want to write to the raw `res` object instead of letting Toa handle the response for you.

Note that using this is __not__ supported by Toa. This may break intended functionality of Toa middleware and Toa itself. Using this property is considered a hack and is only a convenience to those wishing to use traditional `fn(req, res)` functions and middleware within Toa.

#### ctx.catchStream(stream)

Catch a `stream`'s error, if 'error' event emit from the stream, the error will be throw to Thunk's `onerror` and response it.

### Request aliases

The following accessors and alias [Request](request.md) equivalents:

- `ctx.header`
- `ctx.headers`
- `ctx.method`
- `ctx.method=`
- `ctx.url`
- `ctx.url=`
- `ctx.origin`
- `ctx.originalUrl`
- `ctx.href`
- `ctx.path`
- `ctx.path=`
- `ctx.query`
- `ctx.query=`
- `ctx.querystring`
- `ctx.querystring=`
- `ctx.host`
- `ctx.hostname`
- `ctx.fresh`
- `ctx.stale`
- `ctx.socket`
- `ctx.protocol`
- `ctx.secure`
- `ctx.ip`
- `ctx.ips`
- `ctx.idempotent`
- `ctx.subdomains`
- `ctx.is()`
- `ctx.accepts()`
- `ctx.acceptsEncodings()`
- `ctx.acceptsCharsets()`
- `ctx.acceptsLanguages()`
- `ctx.get()`
- `ctx.search()`

### Response aliases

The following accessors and alias [Response](response.md) equivalents:

- `ctx.body`
- `ctx.body=`
- `ctx.status`
- `ctx.status=`
- `ctx.message`
- `ctx.message=`
- `ctx.length=`
- `ctx.length`
- `ctx.type=`
- `ctx.type`
- `ctx.headerSent`
- `ctx.redirect()`
- `ctx.attachment()`
- `ctx.set()`
- `ctx.append()`
- `ctx.remove()`
- `ctx.vary()`
- `ctx.lastModified=`
- `ctx.etag=`


------

## Request
> The same as [Koa's Request](https://github.com/koajs/koa/blob/master/docs/api/request.md)

`Request` object is an abstraction on top of node's vanilla request object, providing additional functionality that is useful for every day HTTP server development.

### API

#### request.header

Request header object.

#### request.headers

Request header object. Alias as `request.header`.

#### request.method

Request method.

#### request.method=

Set request method, useful for implementing middleware such as `methodOverride()`.

#### request.length

Return request Content-Length as a number when present, or `undefined`.

#### request.url

Get request URL.

#### request.url=

Set request URL, useful for url rewrites.

#### request.origin

Get origin of URL.

#### request.originalUrl

Get request original URL.

#### request.href

Get full request URL, include `protocol`, `host` and `url`.

```js
this.request.href
// => http://example.com/foo/bar?q=1
```

#### request.path

Get request pathname.

#### request.path=

Set request pathname and retain query-string when present.

#### request.querystring

Get raw query string void of `?`.

#### request.querystring=

Set raw query string.

#### request.search

Get raw query string with the `?`.

#### request.search=

Set raw query string.

#### request.host

Get host (hostname:port) when present. Supports `X-Forwarded-Host` when `app.proxy` is __true__, otherwise `Host` is used.

#### request.hostname

Get hostname when present. Supports `X-Forwarded-Host` when `app.proxy` is __true__, otherwise `Host` is used.

#### request.type

Get request `Content-Type` void of parameters such as "charset".

```js
var ct = this.request.type
// => "image/png"
```

#### request.charset

Get request charset when present, or `undefined`:

```js
this.request.charset
// => "utf-8"
```

#### request.query

Get parsed query-string, returning an empty object when no query-string is present. Note that this getter does _not_ support nested parsing.

For example "color=blue&size=small":

```js
{
  color: 'blue',
  size: 'small'
}
```

#### request.query=

Set query-string to the given object. Note that this setter does _not_ support nested objects.

```js
this.query = {next: '/login'}
```

#### request.fresh

Check if a request cache is "fresh", aka the contents have not changed. This method is for cache negotiation between `If-None-Match` / `ETag`, and `If-Modified-Since` and `Last-Modified`. It should be referenced after setting one or more of these response headers.

```js
this.status = 200
this.set('ETag', '123')

// cache is ok
if (this.fresh) {
  this.status = 304
  return
}

// cache is stale
// fetch new data
this.body = yield db.find('something')
```

#### request.stale

Inverse of `request.fresh`.

#### request.protocol

Return request protocol, "https" or "http". Supports `X-Forwarded-Proto` when `app.proxy` is __true__.

#### request.secure

Shorthand for `this.protocol == "https"` to check if a request was issued via TLS.

#### request.ip

Request remote address. Supports `X-Forwarded-For` when `app.proxy` is __true__.

#### request.ips

When `X-Forwarded-For` is present and `app.proxy` is enabled an array of these ips is returned, ordered from upstream -> downstream. When disabled an empty array is returned.

#### request.subdomains

Return subdomains as an array.

Subdomains are the dot-separated parts of the host before the main domain of the app. By default, the domain of the app is assumed to be the last two parts of the host. This can be changed by setting `app.subdomainOffset`.

For example, if the domain is "tobi.ferrets.example.com":

If `app.subdomainOffset` is not set, this.subdomains is `["ferrets", "tobi"]`.
If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.

#### request.is(types...)

Check if the incoming request contains the "Content-Type" header field, and it contains any of the give mime `type`s. If there is no request body, `undefined` is returned. If there is no content type, or the match fails `false` is returned. Otherwise, it returns the matching content-type.

```js
// With Content-Type: text/html; charset=utf-8
this.is('html') // => 'html'
this.is('text/html') // => 'text/html'
this.is('text/*', 'text/html') // => 'text/html'

// When Content-Type is application/json
this.is('json', 'urlencoded') // => 'json'
this.is('application/json') // => 'application/json'
this.is('html', 'application/*') // => 'application/json'

this.is('html') // => false
```

For example if you want to ensure that only images are sent to a given route:

```js
if (this.is('image/*')) {
  // process
} else {
  this.throw(415, 'images only!')
}
```

#### Content Negotiation

`Request` object includes helpful content negotiation utilities powered by [accepts](http://github.com/expressjs/accepts) and [negotiator](https://github.com/federomero/negotiator). These utilities are:

- `request.accepts(types)`
- `request.acceptsEncodings(types)`
- `request.acceptsCharsets(charsets)`
- `request.acceptsLanguages(langs)`

If no types are supplied, __all__ acceptable types are returned.

If multiple types are supplied, the best match will be returned. If no matches are found, a `false` is returned, and you should send a `406 "Not Acceptable"` response to the client.

In the case of missing accept headers where any type is acceptable, the first type will be returned. Thus, the order of types you supply is important.

#### request.accepts(types)

Check if the given `type(s)` is acceptable, returning the best match when true, otherwise `false`. The `type` value may be one or more mime type string such as "application/json", the extension name such as "json", or an array `["json", "html", "text/plain"]`.

```js
// Accept: text/html
this.accepts('html')
// => "html"

// Accept: text/*, application/json
this.accepts('html')
// => "html"
this.accepts('text/html')
// => "text/html"
this.accepts('json', 'text')
// => "json"
this.accepts('application/json')
// => "application/json"

// Accept: text/*, application/json
this.accepts('image/png')
this.accepts('png')
// => false

// Accept: text/*;q=.5, application/json
this.accepts(['html', 'json'])
this.accepts('html', 'json')
// => "json"

// No Accept header
this.accepts('html', 'json')
// => "html"
this.accepts('json', 'html')
// => "json"
```

You may call `this.accepts()` as many times as you like, or use a switch:

```js
switch (this.accepts('json', 'html', 'text')) {
  case 'json': break
  case 'html': break
  case 'text': break
  default: this.throw(406, 'json, html, or text only')
}
```

#### request.acceptsEncodings(encodings)

Check if `encodings` are acceptable, returning the best match when true, otherwise `false`. Note that you should include `identity` as one of the encodings!

```js
// Accept-Encoding: gzip
this.acceptsEncodings('gzip', 'deflate', 'identity')
// => "gzip"

this.acceptsEncodings(['gzip', 'deflate', 'identity'])
// => "gzip"
```

When no arguments are given all accepted encodings are returned as an array:

```js
// Accept-Encoding: gzip, deflate
this.acceptsEncodings()
// => ["gzip", "deflate", "identity"]
```

Note that the `identity` encoding (which means no encoding) could be unacceptable if the client explicitly sends `identity;q=0`. Although this is an edge case, you should still handle the case where this method returns `false`.

#### request.acceptsCharsets(charsets)

Check if `charsets` are acceptable, returning the best match when true, otherwise `false`.

```js
// Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5
this.acceptsCharsets('utf-8', 'utf-7')
// => "utf-8"

this.acceptsCharsets(['utf-7', 'utf-8'])
// => "utf-8"
```

When no arguments are given all accepted charsets are returned as an array:

```js
// Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5
this.acceptsCharsets()
// => ["utf-8", "utf-7", "iso-8859-1"]
```

#### request.acceptsLanguages(langs)

Check if `langs` are acceptable, returning the best match when true, otherwise `false`.

```js
// Accept-Language: en;q=0.8, es, pt
this.acceptsLanguages('es', 'en')
// => "es"

this.acceptsLanguages(['en', 'es'])
// => "es"
```

When no arguments are given all accepted languages are returned as an array:

```js
// Accept-Language: en;q=0.8, es, pt
this.acceptsLanguages()
// => ["es", "pt", "en"]
```

#### request.idempotent

Check if the request is idempotent.

#### request.socket

Return the request socket.

#### request.get(field)

Return request header.


------

## Response
> The same as [Koa's Response](https://github.com/koajs/koa/blob/master/docs/api/response.md)

`Response` object is an abstraction on top of node's vanilla response object, providing additional functionality that is useful for every day HTTP server development.

### API

#### response.header

Response header object.

#### response.headers

Response header object. Alias as `response.header`.

#### response.socket

Request socket.

#### response.status

Get response status. By default, `response.status` is not set unlike node's `res.statusCode` which defaults to `200`.

#### response.status=

Set response status via numeric code:

  - 100 "continue"
  - 101 "switching protocols"
  - 102 "processing"
  - 200 "ok"
  - 201 "created"
  - 202 "accepted"
  - 203 "non-authoritative information"
  - 204 "no content"
  - 205 "reset content"
  - 206 "partial content"
  - 207 "multi-status"
  - 300 "multiple choices"
  - 301 "moved permanently"
  - 302 "moved temporarily"
  - 303 "see other"
  - 304 "not modified"
  - 305 "use proxy"
  - 307 "temporary redirect"
  - 400 "bad request"
  - 401 "unauthorized"
  - 402 "payment required"
  - 403 "forbidden"
  - 404 "not found"
  - 405 "method not allowed"
  - 406 "not acceptable"
  - 407 "proxy authentication required"
  - 408 "request time-out"
  - 409 "conflict"
  - 410 "gone"
  - 411 "length required"
  - 412 "precondition failed"
  - 413 "request entity too large"
  - 414 "request-uri too large"
  - 415 "unsupported media type"
  - 416 "requested range not satisfiable"
  - 417 "expectation failed"
  - 418 "i'm a teapot"
  - 422 "unprocessable entity"
  - 423 "locked"
  - 424 "failed dependency"
  - 425 "unordered collection"
  - 426 "upgrade required"
  - 428 "precondition required"
  - 429 "too many requests"
  - 431 "request header fields too large"
  - 500 "internal server error"
  - 501 "not implemented"
  - 502 "bad gateway"
  - 503 "service unavailable"
  - 504 "gateway time-out"
  - 505 "http version not supported"
  - 506 "variant also negotiates"
  - 507 "insufficient storage"
  - 509 "bandwidth limit exceeded"
  - 510 "not extended"
  - 511 "network authentication required"

__NOTE__: don't worry too much about memorizing these strings,
if you have a typo an error will be thrown, displaying this list
so you can make a correction.

#### response.message

Get response status message. By default, `response.message` is associated with `response.status`.

#### response.message=

Set response status message to the given value.

#### response.length=

Set response Content-Length to the given value.

#### response.length

Return response Content-Length as a number when present, or deduce from `this.body` when possible, or `undefined`.

#### response.body

Get response body.

#### response.body=

Set response body to one of the following:

  - `string` written
  - `Buffer` written
  - `Stream` piped
  - `Object` json-stringified
  - `null` no content response

If `response.status` has not been set, Toa will automatically set the status to `200` or `204`.

##### String

The Content-Type is defaulted to text/html or text/plain, both with a default charset of utf-8. The Content-Length field is also set.

##### Buffer

The Content-Type is defaulted to application/octet-stream, and Content-Length is also set.

##### Stream

The Content-Type is defaulted to application/octet-stream.

##### Object

The Content-Type is defaulted to application/json.

#### response.get(field)

Get a response header field value with case-insensitive `field`.

```js
var etag = this.get('etag')
```

#### response.set(field, value)

Set response header `field` to `value`:

```js
this.set('Cache-Control', 'no-cache')
```

#### response.append(field, value)

Append additional header `field` with value `val`.

```js
this.append('Link', '<http://127.0.0.1/>')
```

#### response.set(fields)

Set several response header `fields` with an object:

```js
this.set({
  'ETag': '1234',
  'Last-Modified': date
})
```

#### response.remove(field)

Remove header `field`.

#### response.type

Get response `Content-Type` void of parameters such as "charset".

```js
var ct = this.type
// => "image/png"
```

#### response.type=

Set response `Content-Type` via mime string or file extension.

```js
this.type = 'text/plain; charset=utf-8'
this.type = 'image/png'
this.type = '.png'
this.type = 'png'
```

Note: when appropriate a `charset` is selected for you, for example `response.type = 'html'` will default to "utf-8", however when explicitly defined in full as `response.type = 'text/html'` no charset is assigned.

#### response.is(types...)

Very similar to `this.request.is()`. Check whether the response type is one of the supplied types. This is particularly useful for creating middleware that manipulate responses.

#### response.redirect(url, [alt])

Perform a [302] redirect to `url`.

The string "back" is special-cased to provide Referrer support, when Referrer is not present `alt` or "/" is used.

```js
this.redirect('back')
this.redirect('back', '/index.html')
this.redirect('/login')
this.redirect('http://google.com')
```

To alter the default status of `302`, simply assign the status before or after this call. To alter the body, assign it after this call:

```js
this.status = 301
this.redirect('/cart')
this.body = 'Redirecting to shopping cart'
```

#### response.attachment([filename])

Set `Content-Disposition` to "attachment" to signal the client to prompt for download. Optionally specify the `filename` of the download.

#### response.headerSent

Check if a response header has already been sent. Useful for seeing if the client may be notified on error.

#### response.lastModified

Return the `Last-Modified` header as a `Date`, if it exists.

#### response.lastModified=

Set the `Last-Modified` header as an appropriate UTC string. You can either set it as a `Date` or date string.

```js
this.response.lastModified = new Date()
```

#### response.etag=

Set the ETag of a response including the wrapped `"`s. Note that there is no corresponding `response.etag` getter.

```js
this.response.etag = crypto.createHash('md5').update(this.body).digest('hex')
```

#### response.vary(field)

Vary on `field`.


------

