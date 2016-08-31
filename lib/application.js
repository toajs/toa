'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var util = require('util')
var http = require('http')
var Stream = require('stream')
var thunks = require('thunks')
var accepts = require('accepts')
var Cookies = require('cookies')
var statuses = require('statuses')
var EventEmitter = require('events')

var contextProto = require('./context')
var requestProto = require('./request')
var responseProto = require('./response')
var packageInfo = require('../package.json')

var pwdReg = new RegExp(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
var OnErrorHeaderReg = /^(Accept|Allow|Retry-After|Warning|Access-Control-Allow-)/i

module.exports = Toa
Toa.NAME = packageInfo.name
Toa.VERSION = packageInfo.version
Toa.AUTHORS = packageInfo.authors

function Toa (server, mainHandle, options) {
  if (!(this instanceof Toa)) return new Toa(server, mainHandle, options)
  var app = this
  this.middleware = []
  this.request = Object.create(requestProto)
  this.response = Object.create(responseProto)
  this.context = Object.create(contextProto, {
    onerror: {
      enumerable: true,
      value: function (err) {
        // if error trigger by context, try to respond
        if (err != null && this instanceof Context) err = onResError.call(this, err)
        if (err != null) app.onerror(err)
      }
    },
    onPreEnd: {
      enumerable: true,
      get: function () {
        return this._preEndHooks
      },
      set: function (hook) {
        this._preEndHooks.push(toThunkableFn(hook))
      }
    }
  })

  function Request (ctx) {
    this.ctx = ctx
    this.req = ctx.req
    this.res = ctx.res
    this.accept = accepts(ctx.req)
    this.originalUrl = ctx.req.url
  }
  Request.prototype = app.request
  Request.prototype.constructor = Request

  function Response (ctx) {
    this.ctx = ctx
    this.req = ctx.req
    this.res = ctx.res
  }
  Response.prototype = app.response
  Response.prototype.constructor = Response

  function Context (req, res) {
    EventEmitter.call(this)

    this.req = req
    this.res = res
    this.request = new Request(this)
    this.response = new Response(this)

    this.accept = this.request.accept
    this.originalUrl = this.request.originalUrl
    this.config = Object.create(app.config)
    this.cookies = new Cookies(req, res, {keys: app.keys})
    this.state = {}
    this.thunk = null
    this.seq = null
    this.respond = true
    this._ended = false
    this._finished = null
    // this will improve concurrency performance
    this._preEndHooks = [nextTick]

    var context = this
    this.on('error', this.onerror)
    // socket error should be handled by server's 'clientError' listener then destroy
    res.on('finish', function () {
      if (context._finished == null) {
        context._finished = true // context finished successfully
        context.emit('finish')
      }
    })
    // Maybe no 'close' event on res, we should listen req.
    req.on('close', function () {
      if (context._finished == null) {
        context._finished = false // context finished unexpectedly
        context.emit('close')
      }
    })
  }

  Context.prototype = app.context
  Context.prototype.constructor = Context
  this.Context = Context

  this.server = server && isFn(server.listen) ? server : null
  if (this.server !== server) {
    options = mainHandle
    mainHandle = server
  }

  if (!isFn(mainHandle)) {
    options = mainHandle
    mainHandle = null
  }

  options = options || {}
  this.mainHandle = mainHandle

  if (isFn(options)) {
    this.debug = null
    this.errorHandle = options
  } else {
    this.debug = isFn(options.debug) ? options.debug : null
    this.errorHandle = isFn(options.onerror) ? options.onerror : null
  }

  var config = {
    proxy: false,
    poweredBy: 'Toa',
    subdomainOffset: 2,
    env: process.env.NODE_ENV || 'development'
  }

  Object.defineProperty(this, 'config', {
    enumerable: true,
    get: function () {
      return config
    },
    set: function (obj) {
      var keys = Object.keys(obj || {})
      if (!keys.length) throw new Error(util.inspect(obj) + ' is invalid config object.')
      keys.forEach(function (key) {
        config[key] = obj[key]
      })
    }
  })
}

/**
 * A [Keygrip](https://github.com/expressjs/keygrip) object or an array of keys,
 * will be passed to Cookies to enable cryptographic signing.
 */
Toa.prototype.keys = null

/**
 * Use the given middleware `fn`.
 *
 * @param {Function} fn
 * @return {this}
 * @api public
 */
Toa.prototype.use = function (fn) {
  this.middleware.push(toThunkableFn(fn))
  return this
}

/**
 * start server
 *
 * @param {Mixed} ...
 * @return {this}
 * @api public
 */
Toa.prototype.listen = function () {
  this.server = this.server || http.createServer()
  return this.server
    .on('request', this.toListener())
    .listen.apply(this.server, arguments)
}

/**
 * Return a request listener
 * for node's native http server.
 *
 * @return {Function}
 * @api public
 */
Toa.prototype.toListener = function () {
  var Context = this.Context
  var debug = this.debug
  var errorHandle = this.errorHandle || noOp

  var middleware = this.middleware.slice()
  if (this.mainHandle) middleware.push(toThunkableFn(this.mainHandle))
  middleware.push(function (done) { this.seq(this.onPreEnd)(done) })

  function worker (done) {
    this.seq(middleware)(done)
  }

  return function requestListener (req, res) {
    var ctx = new Context(req, res)
    res.statusCode = 404
    ctx.thunk = thunks(new Scope(ctx, errorHandle, debug))
    ctx.seq = ctx.thunk.seq
    ctx.thunk(worker)(respond)
  }
}

/**
 * Default system error handler.
 *
 * @param {Error} err
 * @api private
 */
Toa.prototype.onerror = function (err) {
  // ignore null and response error
  if (err.expose || (err.status && err.status < 500)) return
  if (!util.isError(err)) err = new Error('non-error thrown: ' + util.inspect(err))
  var msg = err.stack || err.toString()
  console.error(msg.replace(/^/gm, '  '))
}

function Scope (ctx, errorHandle, debug) {
  this.ctx = ctx
  this.errorHandle = errorHandle
  this.debug = debug
  this.stopped = false
}
util.inherits(Scope, thunks.Scope)

Scope.prototype.onstop = function (sig) {
  var ctx = this.ctx
  if (this.stopped) return ctx.onerror(ctx.createError(sig, 500))

  this.stopped = true
  if (ctx.status === 404) {
    ctx.status = 418
    ctx.message = sig.message
  }
  ctx.seq(ctx.onPreEnd)(respond)
}

Scope.prototype.onerror = function (err) {
  var ctx = this.ctx
  if (err == null) return
  try {
    err = this.errorHandle.call(ctx, err) || err
  } catch (error) {
    err = error
  }
  // if err === true, ignore err and response to client
  if (err === true) respond.call(ctx)
  else ctx.onerror(err)
}

/**
 * Response middleware.
 */
function respond () {
  var res = this.res
  var body = this.body
  var code = this.status

  if (this.respond === false) return endContext(this)
  if (res.headersSent || this._finished != null) return
  if (this.config.poweredBy) this.set('x-powered-by', this.config.poweredBy)
  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    this.body = null
    res.end()
  } else if (this.method === 'HEAD') {
    if (isJSON(body)) this.length = Buffer.byteLength(JSON.stringify(body))
    res.end()
  } else if (body == null) {
    // status body
    this.type = 'text'
    body = this.message || String(code)
    this.length = Buffer.byteLength(body)
    res.end(body)
  } else if (typeof body === 'string' || Buffer.isBuffer(body)) {
    res.end(body)
  } else if (body instanceof Stream) {
    body.pipe(res)
    // to ensure `res.headersSent === true` before `context.emit("end")`
    // if "error" occured before "data", it will goto `onResError(error)`
    var ctx = this
    body.once('data', function () { endContext(ctx) })
    return
  } else {
    // body: json
    body = JSON.stringify(body)
    this.length = Buffer.byteLength(body)
    res.end(body)
  }
  endContext(this)
}

/**
 * Default response error handler.
 *
 * @param {Error} err
 * @api private
 */
function onResError (err) {
  // nothing we can do here other
  // than delegate to the app-level
  // handler and log.
  if (this.headerSent || this._finished != null) {
    err.headerSent = this.headerSent
    err.context = this.toJSON()
    return err
  }
  // support JSON error object: {name: 'BadRequest', status: 400, message: 'Some bad request'}
  if (!util.isError(err)) {
    this.body = err
    if (err.status) this.status = err.status
    respond.call(this)
    return
  }
  // unset headers
  var _headers = this.res._headers
  if (_headers) {
    // retain headers on error
    Object.keys(_headers).map(function (key) {
      if (!OnErrorHeaderReg.test(key)) delete _headers[key]
    })
  }
  // force text/plain
  this.type = 'text'
  // support ENOENT to 404, default to 500
  if (err.code === 'ENOENT') this.status = 404
  else if (typeof err.status !== 'number' || !statuses[err.status]) this.status = 500
  else this.status = err.status

  var msg = err.expose ? err.message : statuses[this.status]
  // hide server directory for error response
  this.body = msg.replace(pwdReg, '[application]')
  respond.call(this)
  return err
}

function noOp () {}

function nextTick (done) { setImmediate(done) }

function isFn (fn) { return typeof fn === 'function' }

function toThunkableFn (fn) {
  if (!isFn(fn)) throw new TypeError('middleware must be a function!')
  if (thunks.isThunkableFn(fn)) return fn
  return function (done) { this.thunk(fn.call(this))(done) }
}

// means that application' work delivered
function endContext (ctx) {
  if (!ctx._ended) {
    ctx._ended = true
    ctx.emit('end')
  }
}

function isJSON (body) {
  return body && typeof body !== 'string' && !Buffer.isBuffer(body) &&
    !(body instanceof Stream)
}
