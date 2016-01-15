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
var onFinished = require('on-finished')
var EventEmitter = require('events').EventEmitter

var context = require('./lib/context')
var request = require('./lib/request')
var response = require('./lib/response')
var packageInfo = require('./package.json')

var CORSHeaderReg = /^Access-Control-Allow-/i
var pwdReg = new RegExp(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')

module.exports = Toa

Toa.NAME = packageInfo.name
Toa.VERSION = packageInfo.version
Toa.AUTHORS = packageInfo.authors

function Toa (server, mainFn, options) {
  if (!(this instanceof Toa)) return new Toa(server, mainFn, options)
  var app = this
  this.middleware = []
  this.context = Object.create(context)
  this.request = Object.create(request)
  this.response = Object.create(response)

  this.server = server && isFunction(server.listen) ? server : null
  if (this.server !== server) {
    options = mainFn
    mainFn = server
  }

  if (!isFunction(mainFn)) {
    options = mainFn
    mainFn = noOp
  }

  options = options || {}
  this.mainFn = mainFn

  if (isFunction(options)) {
    this.errorHandle = options
    this.debug = null
    this.stopHandle = null
  } else {
    this.debug = isFunction(options.debug) ? options.debug : null
    this.stopHandle = isFunction(options.onstop) ? options.onstop : null
    this.errorHandle = isFunction(options.onerror) ? options.onerror : null
  }

  var config = {
    env: process.env.NODE_ENV || 'development',
    subdomainOffset: 2,
    poweredBy: 'Toa',
    proxy: false
  }

  Object.defineProperty(this, 'config', {
    enumerable: true,
    get: function () {
      return config
    },
    set: function (obj) {
      if (!obj || obj.constructor !== Object) throw new Error('config require a object')
      Object.keys(obj).map(function (key) {
        config[key] = obj[key]
      })
    }
  })

  Object.defineProperty(this.context, 'onerror', {
    enumerable: true,
    value: function (err) {
      if (err == null) return
      // if error trigger by context, try to respond
      if (this.req && this.res) err = onResError.call(this, err)
      if (err != null) app.onerror(err)
    }
  })

  Object.defineProperty(this.context, 'onPreEnd', {
    enumerable: true,
    get: function () {
      return this._preEndHandlers.slice()
    },
    set: function (handle) {
      this._preEndHandlers.push(handle)
    }
  })
}

/**
 * Toa prototype.
 */

var proto = Toa.prototype

/**
 * A [Keygrip](https://github.com/expressjs/keygrip) object or an array of keys,
 * will be passed to Cookies to enable cryptographic signing.
 */

proto.keys = ['toa']

/**
 * Use the given middleware `fn`.
 *
 * @param {Function} fn
 * @return {this}
 * @api public
 */

proto.use = function (fn) {
  if (!isFunction(fn)) throw new Error('require a thunk function or a generator function')
  this.middleware.push(fn)
  return this
}

/**
 * start server
 *
 * @param {Mixed} ...
 * @return {this}
 * @api public
 */

proto.listen = function () {
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

proto.toListener = function () {
  var app = this
  var mainFn = this.mainFn
  var debug = this.debug
  var stopHandle = this.stopHandle || noOp
  var errorHandle = this.errorHandle || noOp
  var middleware = this.middleware.slice()

  return function requestListener (req, res) {
    var thunk = thunks({
      debug: debug,
      onstop: onstop,
      onerror: onerror
    })
    var ctx = createContext(app, req, res, thunk)
    ctx.on('error', ctx.onerror)

    res.statusCode = 404
    if (ctx.config.poweredBy) ctx.set('X-Powered-By', ctx.config.poweredBy)

    onFinished(res, function (err) {
      ctx.emit('finished', err)
      var body = ctx.body
      if (body instanceof Stream && body.toaCleanHandle) body.toaCleanHandle(err)
      else if (err != null) ctx.onerror(err)
    })

    var seq = thunk.seq
    seq.call(ctx, middleware)(function () {
      return mainFn.call(ctx)
    })(function () {
      return seq.call(ctx, ctx.onPreEnd)
    })(respond)

    function onstop (sig) {
      if (ctx.status === 404) {
        ctx.status = 418
        ctx.message = sig.message
      }
      ctx.thunk(stopHandle.call(ctx, sig))(function () {
        return seq.call(ctx, ctx.onPreEnd)
      })(respond)
    }

    function onerror (err) {
      if (err == null) return

      try {
        err = errorHandle.call(ctx, err) || err
      } catch (error) {
        err = error
      }
      // ignore err and response to client
      if (err === true) return respond.call(ctx)
      ctx.onerror(err)
    }
  }
}

/**
 * Default system error handler.
 *
 * @param {Error} err
 * @api private
 */

proto.onerror = function (err) {
  // ignore null and response error
  if (err == null || err.expose || (err.status && err.status < 500)) return
  if (!util.isError(err)) err = new Error('non-error thrown: ' + err)

  // catch system error
  var msg = err.stack || err.toString()
  console.error(msg.replace(/^/gm, '  '))
}

/**
 * Response middleware.
 */

function respond () {
  var res = this.res
  if (this.respond === false) return endRespond(this)
  if (res.headersSent || !this.writable) return

  var body = this.body
  var code = this.status

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
  } else {
    // body: json
    body = JSON.stringify(body)
    this.length = Buffer.byteLength(body)
    res.end(body)
  }
  endRespond(this)
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
  if (this.headerSent || !this.writable) {
    err.headerSent = true
    return err
  }

  if (!util.isError(err)) {
    this.body = err
    if (err.status) this.status = err.status
    respond.call(this)
    return
  }

  // unset headers
  var _headers = this.res._headers
  if (_headers) {
    // retain CORS headers
    Object.keys(_headers).map(function (key) {
      if (!CORSHeaderReg.test(key)) delete _headers[key]
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

/**
 * Initialize a new context.
 *
 * @api private
 */

function createContext (app, req, res, thunk) {
  var context = Object.create(app.context)
  var request = context.request = Object.create(app.request)
  var response = context.response = Object.create(app.response)

  response.request = request
  request.response = response
  request.ctx = response.ctx = context
  context.req = request.req = response.req = req
  context.res = request.res = response.res = res
  context.originalUrl = request.originalUrl = req.url
  context.cookies = new Cookies(req, res, app.keys)
  context.accept = request.accept = accepts(req)
  context.config = Object.create(app.config)
  context.respond = null
  context.thunk = thunk
  context.state = {}
  context._ended = false
  context._preEndHandlers = []

  EventEmitter.call(context)
  return context
}

function noOp () {}

function isFunction (fn) {
  return typeof fn === 'function'
}

function endRespond (ctx) {
  if (ctx._ended) return
  ctx._ended = true
  ctx.emit('end')
}

function isJSON (body) {
  return body && typeof body !== 'string' && !Buffer.isBuffer(body) &&
    !(body instanceof Stream)
}

if (process.env.NODE_ENV === 'test') {
  Toa.createContext = function () {
    return createContext.apply(null, arguments)
  }
}
