## Context

Similar to [Koa's Context](https://github.com/koajs/koa/blob/master/docs/api/context.md)

### Difference from Koa

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
const app = Toa(function * () {
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

Add hooks dynamicly. Hooks will be executed in LIFO order after middlewares, but before `respond`.

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
let err = new Error('name required')
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
