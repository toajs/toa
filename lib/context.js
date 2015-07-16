'use strict'

// get from https://github.com/koajs/koa/tree/master/lib

/**
 * Module dependencies.
 */

var destroy = require('destroy')
var delegate = require('delegates')
var httpAssert = require('http-assert')
var createError = require('http-errors')
var EventEmitter = require('events').EventEmitter

/**
 * context prototype.
 */

var proto = module.exports = Object.create(EventEmitter.prototype)

/**
 * util.inspect() implementation, which
 * just returns the JSON output.
 *
 * @return {Object}
 * @api public
 */

proto.inspect = function () {
  return this.toJSON()
}

/**
 * Return JSON representation.
 *
 * Here we explicitly invoke .toJSON() on each
 * object, as iteration will otherwise fail due
 * to the getters and cause utilities such as
 * clone() to fail.
 *
 * @return {Object}
 * @api public
 */

proto.toJSON = function () {
  return {
    request: this.request && this.request.toJSON(),
    response: this.response && this.response.toJSON(),
    config: this.config,
    originalUrl: this.originalUrl,
    req: '<original node req>',
    res: '<original node res>',
    socket: '<original node socket>'
  }
}

/**
 * Similar to .throw(), adds assertion.
 *
 *    this.assert(this.user, 401, 'Please login!')
 *
 * See: https://github.com/jshttp/http-assert
 *
 * @param {Mixed} test
 * @param {Number} status
 * @param {String} message
 * @api public
 */

proto.assert = httpAssert

/**
 * Throw an error with `msg` and optional `status`
 * defaulting to 500. Note that these are user-level
 * errors, and the message may be exposed to the client.
 *
 *    this.throw(403)
 *    this.throw('name required', 400)
 *    this.throw(400, 'name required')
 *    this.throw('something exploded')
 *    this.throw(new Error('invalid'), 400)
 *    this.throw(400, new Error('invalid'))
 *
 * See: https://github.com/jshttp/http-errors
 *
 * @param {String|Number|Error} err, msg or status
 * @param {String|Number|Error} [err, msg or status]
 * @param {Object} [props]
 * @api public
 */

proto.throw = function () {
  throw createError.apply(null, arguments)
}

/**
 * Stop request process with `message` and respond immediately.
 *
 *    this.end() // with default message "process stopped"
 *    this.end('some message')
 *
 * See: https://github.com/thunks/thunks
 * @param {String} message
 * @api public
 */

proto.end = function (message) {
  this.thunk.stop(message)
}

/**
 * Catch stream error, if 'error' event emit from stream, the error will be throw to Thunk's `onerror`.
 *
 *    this.catchStream(stream)
 *
 * @param {Stream} stream to thunk
 * @return {Stream}
 * @api public
 */

proto.catchStream = function (stream) {
  var ctx = this
  if (stream.toaCatchStream) stream.toaCatchStream()

  var toaCatchStream = stream.toaCatchStream = function (err) {
    stream.removeListener('error', toaCatchStream)
    stream.toaCatchStream = null
    if (err == null) return
    destroy(stream)
    ctx.onerror(err)
  }
  stream.on('error', toaCatchStream)
  return stream
}

/**
 * Response delegation.
 */

delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('set')
  .method('append')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable')

/**
 * Request delegation.
 */

delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('url')
  .getter('href')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('header')
  .getter('headers')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip')
