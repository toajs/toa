'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var util = require('util')
var http = require('http')
var Stream = require('stream')

var thunks = require('thunks')
var statuses = require('statuses')
var Cookies = require('cookies')
var accepts = require('accepts')
var isJSON = require('koa-is-json')
var onFinished = require('on-finished')
var EventEmitter = require('events').EventEmitter

var context = require('./lib/context')
var request = require('./lib/request')
var response = require('./lib/response')

var pwdReg = new RegExp(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')

module.exports = Toa

Toa.NAME = 'Toa'
Toa.VERSION = 'v0.11.1'

function Toa (server, body, options) {
  if (!(this instanceof Toa)) return new Toa(server, body, options)

  this.middleware = []
  this.context = Object.create(context)
  this.request = Object.create(request)
  this.response = Object.create(response)
  this.server = server && isFunction(server.listen) ? server : http.createServer()

  if (this.server !== server) {
    options = body
    body = server
  }

  if (!isFunction(body)) {
    options = body
    body = noOp
  }

  options = options || {}
  this.body = body

  if (isFunction(options)) {
    this.errorHandler = options
    this.debug = null
  } else {
    this.debug = isFunction(options.debug) ? options.debug : null
    this.errorHandler = isFunction(options.onerror) ? options.onerror : null
  }

  var config = {
    proxy: false,
    env: process.env.NODE_ENV || 'development',
    subdomainOffset: 2,
    poweredBy: 'Toa'
  }

  Object.defineProperty(this, 'config', {
    get: function () {
      return config
    },
    set: function (obj) {
      if (!obj || obj.constructor !== Object) throw new Error('config require a object')
      for (var key in obj) config[key] = obj[key]
    },
    enumerable: true,
    configurable: false
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
  var app = this
  var args = arguments
  var body = this.body
  var debug = this.debug
  var server = this.server
  var errorHandler = this.errorHandler
  var middleware = this.middleware.slice()

  server.addListener('request', function (req, res) {
    res.statusCode = 404
    function onerror (err) {
      if (err == null) return
      if (errorHandler) {
        try {
          err = errorHandler.call(ctx, err) || err
        } catch (error) {
          err = error
        }
      }
      // ignore err and response to client
      if (err === true) return ctx.thunk.seq.call(ctx, ctx.onPreEnd)(respond)

      try {
        onResError.call(ctx, err)
      } catch (error) {
        app.onerror.call(ctx, error)
      }
    }

    var ctx = createContext(app, req, res, thunks({
      debug: debug,
      onerror: onerror
    }))

    ctx.on('error', onerror)
    ctx.onerror = onerror
    onFinished(res, function (err) {
      ctx.emit('end')
      onerror(err)
    })

    if (ctx.config.poweredBy) ctx.set('X-Powered-By', ctx.config.poweredBy)

    ctx.thunk.seq.call(ctx, middleware)(function () {
      return body.call(this, this.thunk)
    })(function () {
      return this.thunk.seq.call(this, this.onPreEnd)
    })(respond)
  })

  return server.listen.apply(server, args)
}

/**
 * Default system error handler.
 *
 * @param {Error} err
 * @api private
 */

proto.onerror = function (err) {
  // ignore null and response error
  if (err == null || (err.status && err.status < 500)) return
  if (!util.isError(err)) err = new Error('non-error thrown: ' + err)

  // catch system error
  var msg = err.stack || err.toString()
  console.error(msg.replace(/^/gm, '  '))
}

/**
 * Response middleware.
 */

function respond () {
  var ctx = this
  if (this.respond === false) return

  var res = this.res
  if (res.headersSent || !this.writable) return

  var body = this.body
  var code = this.status

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    this.body = null
    res.end()

    if (body instanceof Stream) body.once('error', ctx.onerror)

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
}

/**
 * Default response error handler.
 *
 * @param {Error} err
 * @api private
 */

function onResError (err) {
  if (err == null) return

  // nothing we can do here other
  // than delegate to the app-level
  // handler and log.
  if (this.headerSent || !this.writable) throw err

  // unset all headers
  this.res._headers = {}

  if (!util.isError(err)) {
    this.body = err
    if (err.status) this.status = err.status
    return respond.call(this)
  }

  // support ENOENT to 404, default to 500
  if (err.code === 'ENOENT') this.status = 404
  else if (typeof err.status !== 'number' || !statuses[err.status]) this.status = 500
  else this.status = err.status

  var msg = err.expose ? err.message : statuses[this.status]

  // hide server directory for error response
  this.body = msg.replace(pwdReg, '[Server Directory]')
  respond.call(this)
  throw err
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
  var preEndHandlers = []

  response.request = request
  request.response = response
  request.ctx = response.ctx = context
  context.req = request.req = response.req = req
  context.res = request.res = response.res = res
  context.originalUrl = request.originalUrl = req.url
  context.cookies = new Cookies(req, res, app.keys)
  context.accept = request.accept = accepts(req)
  context.config = Object.create(app.config)
  context.thunk = thunk
  context.state = {}

  Object.defineProperty(context, 'onPreEnd', {
    get: function () {
      return preEndHandlers.slice()
    },
    set: function (handler) {
      preEndHandlers.push(handler)
    },
    enumerable: true,
    configurable: false
  })

  EventEmitter.call(context)
  return context
}

function noOp () {}

function isFunction (fn) {
  return typeof fn === 'function'
}

Toa.createContext = function () {
  // It is exported for test, don't use it in application!
  return createContext.apply(null, arguments)
}
