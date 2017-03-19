'use strict'
// Modified from https://github.com/koajs/koa/tree/master/lib

const destroy = require('destroy')
const delegate = require('delegates')
const EventEmitter = require('events')
const createError = require('http-errors')
const IncomingMessage = require('http').IncomingMessage

const CLEAN_HANDLER = Symbol('Stream#cleanHandle')

/**
 * context prototype.
 */
const proto = module.exports = Object.create(EventEmitter.prototype)

/**
 * Create a error object, but don't throw
 *
 *    let error = this.createError(400)
 *
 * See: https://github.com/jshttp/http-errors
 *
 * @param {String|Number|Error} [status, message, properties]
 * @param {Object} [properties]
 * @return {Error}
 * @api public
 */
proto.createError = createError

/**
 * Similar to .throw(), adds assertion.
 *
 *    this.assert(this.user, 401, 'Please login!')
 *
 * @param {Mixed} test
 * @param {Number} status
 * @param {String} message
 * @api public
 */
proto.assert = function (value, status, msg, opts) {
  if (!value) throw this.createError(status, msg, opts)
}

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
proto.throw = function (status, msg, opts) {
  throw this.createError(status, msg, opts)
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
  if (stream[CLEAN_HANDLER]) throw new Error('"catchStream" has been applied on the stream')

  let streamCleanHandler = (err) => {
    stream.removeListener('error', streamCleanHandler)
    this.removeListener('finish', streamCleanHandler)
    this.removeListener('close', streamCleanHandler)
    stream[CLEAN_HANDLER] = null
    // ensure that stream has the error listener to application
    // stream may emit error even if destroyed,
    // such as fs.createReadStream('not_exist_file')
    if (!~stream.listeners('error').indexOf(this.onerror)) stream.on('error', this.onerror)
    if (err != null) this.onerror(err)
    else if (this.finished) {
      // finished normally
      let shouldKeepAlive = stream instanceof IncomingMessage && stream.req.shouldKeepAlive
      // If incomingMessage stream is ended and agent is keepalived
      // the socket should be disbanded, in order not to be destroy.
      if (shouldKeepAlive && stream._readableState.ended === true) {
        stream.socket = stream.connection = null
      }
    }
    destroy(stream)
  }
  stream[CLEAN_HANDLER] = streamCleanHandler
  // make sure ctx.onerror not exist
  // because new error handle will emit error to this.onerror
  stream.removeListener('error', this.onerror)
  stream.on('error', streamCleanHandler)
  this.on('finish', streamCleanHandler)
  this.on('close', streamCleanHandler)
  return stream
}

/**
 * @return {Function}
 * @api private
 */
proto.getStreamCleanHandler = function (stream) {
  return (stream && stream[CLEAN_HANDLER]) || null
}

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
    config: this.config,
    originalUrl: this.originalUrl,
    req: '<original node req>',
    res: '<original node res>',
    socket: '<original node socket>',
    request: this.request && this.request.toJSON(),
    response: this.response && this.response.toJSON()
  }
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
  .getter('origin')
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
