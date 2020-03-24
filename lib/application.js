'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

const util = require('util')
const http = require('http')
const Stream = require('stream')
const thunks = require('thunks')
const accepts = require('accepts')
const Cookies = require('cookies')
const statuses = require('statuses')
const EventEmitter = require('events')

const contextProto = require('./context')
const requestProto = require('./request')
const responseProto = require('./response')
const packageInfo = require('../package.json')

const ON_ERROR_HEADER_REG = /^(accept|allow|retry-after|warning|vary|server|x-powered-by|access-control-allow-|x-ratelimit-)/i

module.exports = Toa
Toa.Toa = Toa
Toa.NAME = packageInfo.name
Toa.VERSION = packageInfo.version

function Toa (server, options) {
  if (!(this instanceof Toa)) return new Toa(server, options)

  const app = this
  this.server = server && isFn(server.listen) ? server : null
  if (this.server !== server) {
    options = server
  }

  options = options || {}
  if (isFn(options)) this.errorHandler = options
  else this.errorHandler = isFn(options.onerror) ? options.onerror : null

  this.middleware = []
  this.request = Object.create(requestProto)
  this.response = Object.create(responseProto)
  this.context = Object.create(contextProto, {
    onerror: {
      enumerable: true,
      value: function (err) {
        // if error trigger by context, try to respond
        if (err != null && this instanceof Context) {
          this.thunk.cancel()
          err = onResError(this, err)
        }
        if (err != null) app.onerror(err)
      }
    },
    after: {
      enumerable: true,
      value: function (hook) {
        if (!this._afterHooks) {
          throw new Error("Can't add hook after middleware process.")
        }
        return this._afterHooks.push(toThunkable(hook))
      }
    },
    ended: {
      enumerable: true,
      get: function () { return this._ended }
    },
    finished: {
      enumerable: true,
      get: function () { return this._finished === true }
    },
    closed: {
      enumerable: true,
      get: function () { return this._closed === true }
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
    this._body = undefined
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

    this.cookies = new Cookies(req, res, {
      keys: app.keys,
      secure: app.config.secureCookie == null ? this.request.secure : app.config.secureCookie
    })
    this.state = {}
    this.thunk = null
    this.seq = null
    this.respond = true
    this._ended = false // false | true
    this._finished = false // false | true
    this._closed = false // false | true
    this._afterHooks = []

    this.on('error', this.onerror)
    // socket error should be handled by server's 'clientError' listener then destroy
    res.on('finish', () => {
      if (!this._finished) {
        this._finished = true // context finished successfully
        this.emit('finish')
      }
    })
    // Maybe no 'close' event on res, we should listen req.
    req.on('close', () => {
      if (!this._closed) {
        this.thunk.cancel() // cancel async process
        this._closed = true // context finished unexpectedly
        this.emit('close')
      }
    })
  }
  Context.prototype = app.context
  Context.prototype.constructor = Context
  this.Context = Context

  const config = {
    proxy: false,
    poweredBy: '',
    secureCookie: null,
    subdomainOffset: 2,
    env: process.env.NODE_ENV || 'development'
  }

  Object.defineProperty(this, 'config', {
    enumerable: true,
    get: () => config,
    set: (obj) => {
      for (const key of Object.keys(obj)) config[key] = obj[key]
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
  this.middleware.push(toThunkable(fn))
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
  if (!this.server) this.server = http.createServer()
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
  const Context = this.Context
  const errorHandler = this.errorHandler || noOp
  const middleware = this.middleware.slice()

  function fanal (err) {
    if (err == null) return respond.call(this)

    try {
      err = errorHandler.call(this, err) || err
    } catch (error) {
      err = error
    }
    // if err === true, ignore err and response to client
    if (err === true) respond.call(this)
    else this.onerror(err)
  }

  class Scope extends thunks.Scope {
    constructor (ctx) {
      super()
      this.ctx = ctx
    }

    onstop (sig) {
      if (this.ctx.body == null && sig != null) this.ctx.body = sig
      consumeHooks.call(this.ctx)(fanal)
    }
  }

  return function requestListener (req, res) {
    const ctx = new Context(req, res)
    // Misdirected request, http://tools.ietf.org/html/rfc7540#section-9.1.2
    // The request was directed at a server that is not able to produce a response.
    res.statusCode = 421
    ctx.thunk = thunks(new Scope(ctx))
    ctx.seq = ctx.thunk.seq
    ctx.seq(middleware)(consumeHooks)(fanal)
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
  if (!isError(err)) err = new Error('non-error thrown: ' + util.inspect(err))
  const msg = err.stack || err.toString()
  console.error(msg.replace(/^/gm, '  '))
}

/**
 * Response middleware.
 */
function respond () {
  const res = this.res
  let body = this.body
  const code = this.status

  if (this.respond === false) return endContext(this)
  if (res.headersSent || this.finished) return

  this.set('server', 'Toa/' + Toa.VERSION)
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
    // if "error" occured before "data", it will goto `onResError(this, error)`
    body.once('data', () => endContext(this))
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
function onResError (ctx, err) {
  // nothing we can do here other
  // than delegate to the app-level
  // handler and log.
  if (ctx.headerSent || ctx.finished) {
    err.headerSent = ctx.headerSent
    err.context = ctx.toJSON()
    return err
  }

  // unset headers
  if (isFn(ctx.res.getHeaderNames)) {
    for (const name of ctx.res.getHeaderNames()) {
      if (!ON_ERROR_HEADER_REG.test(name)) ctx.res.removeHeader(name)
    }
  } else { // Node < 7.7
    const _headers = ctx.res._headers
    if (_headers) {
      // retain headers on error
      for (const name of Object.keys(_headers)) {
        if (!ON_ERROR_HEADER_REG.test(name)) delete _headers[name]
      }
    }
  }
  // support ENOENT to 404, default to 500
  if (err.code === 'ENOENT') ctx.status = 404
  else if (typeof err.status !== 'number' || !statuses[err.status]) ctx.status = 500
  else ctx.status = err.status

  ctx.set('x-content-type-options', 'nosniff')
  // support JSON error object: { error: 'BadRequest', message: 'Some bad request' }
  ctx.body = !isError(err) ? err : {
    error: err.error || err.name,
    message: err.expose ? err.message : statuses[ctx.status]
  }
  respond.call(ctx)
  return err
}

// means that application' work delivered
function endContext (ctx) {
  if (!ctx._ended) {
    ctx._ended = true
    ctx.emit('end')
  }
}

function consumeHooks (err) {
  if (err != null) throw err
  const hooks = this._afterHooks || []
  this._afterHooks = null
  hooks.reverse() // execute hooks in LIFO order
  return this.seq(hooks)
}

function noOp () {}

function isFn (fn) { return typeof fn === 'function' }

function isError (err) { return err instanceof Error }

function isJSON (body) {
  return body && typeof body !== 'string' && !Buffer.isBuffer(body) &&
    !(body instanceof Stream)
}

function toThunkable (fn) {
  if (isFn(fn)) {
    if (thunks.isThunkableFn(fn)) return fn
    return function (done) { this.thunk(fn.call(this))(done) }
  }
  if (fn && isFn(fn.toThunk)) return fn.toThunk()
  throw new TypeError(`${fn} is not a function or "toThunk" object`)
}
