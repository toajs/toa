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

var contextProto = require('./context')
var requestProto = require('./request')
var responseProto = require('./response')
var packageInfo = require('../package.json')

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
  this.request = Object.create(requestProto)
  this.response = Object.create(responseProto)
  this.context = Object.create(contextProto, {
    onerror: {
      enumerable: true,
      value: function (err) {
        if (err == null) return
        // if error trigger by context, try to respond
        if (app.context.isPrototypeOf(this)) err = onResError.call(this, err)
        if (err != null) app.onerror(err)
      }
    },
    onPreEnd: {
      enumerable: true,
      get: function () {
        return this._preEndHandlers
      },
      set: function (handle) {
        assertFunction(handle)
        this._preEndHandlers.push(handle)
      }
    }
  })

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
    this.debug = null
    this.stopHandle = null
    this.errorHandle = options
  } else {
    this.debug = isFunction(options.debug) ? options.debug : null
    this.stopHandle = isFunction(options.onstop) ? options.onstop : null
    this.errorHandle = isFunction(options.onerror) ? options.onerror : null
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
      if (!keys.length) throw new Error(String(obj) + ' is invalid config object.')
      keys.map(function (key) {
        config[key] = obj[key]
      })
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
  assertFunction(fn)
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
    var thunk, ctx, seq

    thunk = thunks({
      debug: debug,
      onstop: function (sig) {
        if (ctx.status === 404) {
          ctx.status = 418
          ctx.message = sig.message
        }
        thunk.call(ctx, stopHandle.call(ctx, sig))(function () {
          return seq.call(ctx, ctx.onPreEnd)
        })(respond)
      },
      onerror: function (err) {
        if (err == null) return

        try {
          err = errorHandle.call(ctx, err) || err
        } catch (error) {
          err = error
        }
        // ignore err and response to client
        if (err === true) respond.call(ctx)
        else ctx.onerror(err)
      }
    })

    seq = thunk.seq
    ctx = createContext(app, req, res, thunk)
    ctx.on('error', ctx.onerror)
    onFinished(res, function (err) {
      ctx.emit('finished', err)
      var body = ctx.body
      if (body instanceof Stream && body.toaCleanHandle) body.toaCleanHandle(err)
      else if (err != null) ctx.onerror(err)
    })

    res.statusCode = 404
    seq.call(ctx, middleware)(function () {
      return mainFn.call(ctx)
    })(function () {
      return seq.call(ctx, ctx.onPreEnd)
    })(respond)
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

  if (this.config.poweredBy) this.set('X-Powered-By', this.config.poweredBy)
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
  context.cookies = new Cookies(req, res, {keys: app.keys})
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

function assertFunction (fn) {
  if (!isFunction(fn)) throw new Error('require a thunk function or a generator function')
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
