'use strict'
// Modified from https://github.com/koajs/koa/tree/master/lib

var vary = require('vary')
var Stream = require('stream')
var statuses = require('statuses')
var typeis = require('type-is').is
var extname = require('path').extname
var escapeHtml = require('escape-html')
var getType = require('mime-types').contentType
var contentDisposition = require('content-disposition')

module.exports = {

  get request () {
    return this.ctx.request
  },

  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */
  get socket () {
    return this.req.socket
  },

  /**
   * Return response header.
   *
   * @return {Object}
   * @api public
   */
  get header () {
    // TODO: wtf
    return this.res._headers || {}
  },

  /**
   * Return response header, alias as response.header
   *
   * @return {Object}
   * @api public
   */
  get headers () {
    return this.header
  },

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */
  get status () {
    return this.res.statusCode
  },

  /**
   * Set response status code.
   *
   * @param {Number} code
   * @api public
   */
  set status (code) {
    if (typeof code !== 'number') throw new Error('status code must be a number')
    if (!statuses[code]) throw new Error('invalid status code: ' + code)
    this._explicitStatus = true
    this.res.statusCode = code
    this.res.statusMessage = statuses[code]
    if (this.body && statuses.empty[code]) this.body = null
  },

  /**
   * Get response status message
   *
   * @return {String}
   * @api public
   */
  get message () {
    return this.res.statusMessage || statuses[this.status]
  },

  /**
   * Set response status message
   *
   * @param {String} msg
   * @api public
   */
  set message (msg) {
    this.res.statusMessage = msg
  },

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */
  get body () {
    return this._body
  },

  /**
   * Set response body.
   *
   * @param {String|Buffer|Object|Stream} val
   * @api public
   */
  set body (val) {
    var original = this._body
    if (val === original) return
    this._body = val
    // destroy stream if previous body is a stream.
    // we should do it if error happenned
    if (original instanceof Stream && original.toaCleanHandle) original.toaCleanHandle()
    // no content
    if (val == null) {
      if (!statuses.empty[this.status]) this.status = 204
      this.remove('content-type')
      this.remove('content-length')
      this.remove('transfer-encoding')
      return
    }

    // set the status
    if (!this._explicitStatus) this.status = 200

    // set the content-type only if not yet set
    var setType = !this.header['content-type']

    if (typeof val === 'string') {
      // string
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text'
      this.length = Buffer.byteLength(val)
    } else if (Buffer.isBuffer(val)) {
      // buffer
      if (setType) this.type = 'bin'
      this.length = val.length
    } else if (val instanceof Stream) {
      // stream
      // catch error from stream
      this.ctx.catchStream(val)
      if (original != null && original !== val) this.remove('content-length')
      if (setType) this.type = 'bin'
    } else {
      // json
      this.remove('content-length')
      this.type = 'json'
    }
  },

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   * @api public
   */
  set length (n) {
    this.set('content-length', n)
  },

  /**
   * Return parsed response Content-Length when present.
   *
   * @return {Number}
   * @api public
   */
  get length () {
    var len = this.header['content-length']
    var body = this.body

    if (len == null) {
      if (!body) return
      if (typeof body === 'string') return Buffer.byteLength(body)
      if (Buffer.isBuffer(body)) return body.length
      if (body instanceof Stream) return
      return Buffer.byteLength(JSON.stringify(body))
    }

    return ~~len
  },

  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   * @api public
   */
  get headerSent () {
    return this.res.headersSent
  },

  /**
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */
  vary: function (field) {
    vary(this.res, field)
  },

  /**
   * Perform a 302 redirect to `url`.
   *
   * The string "back" is special-cased
   * to provide Referrer support, when Referrer
   * is not present `alt` or "/" is used.
   *
   * Examples:
   *
   *    this.redirect('back')
   *    this.redirect('back', '/index.html')
   *    this.redirect('/login')
   *    this.redirect('http://google.com')
   *
   * @param {String} url
   * @param {String} alt
   * @api public
   */
  redirect: function (url, alt) {
    // location
    if (url === 'back') url = this.ctx.get('referrer') || alt || '/'
    this.set('location', url)

    // status
    if (!statuses.redirect[this.status]) this.status = 302

    // html
    if (this.ctx.accepts('html')) {
      url = escapeHtml(url)
      this.type = 'text/html; charset=utf-8'
      this.body = 'Redirecting to <a href="' + url + '">' + url + '</a>.'
      return
    }

    // text
    this.type = 'text/plain; charset=utf-8'
    this.body = 'Redirecting to ' + url + '.'
  },

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {String} filename
   * @api public
   */
  attachment: function (filename) {
    if (filename) this.type = extname(filename)
    this.set('content-disposition', contentDisposition(filename))
  },

  /**
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain a charset.
   *
   * Examples:
   *
   *     this.type = '.html'
   *     this.type = 'html'
   *     this.type = 'json'
   *     this.type = 'application/json'
   *     this.type = 'png'
   *
   * @param {String} type
   * @api public
   */
  set type (type) {
    type = getType(type)
    if (type) this.set('content-type', type)
    else this.remove('content-type')
  },

  /**
   * Set the Last-Modified date using a string or a Date.
   *
   *     this.response.lastModified = new Date()
   *     this.response.lastModified = '2013-09-13'
   *
   * @param {String|Date} type
   * @api public
   */
  set lastModified (val) {
    if (typeof val === 'string') val = new Date(val)
    this.set('last-modified', val.toUTCString())
  },

  /**
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @return {Date}
   * @api public
   */
  get lastModified () {
    var date = this.get('last-modified')
    if (date) return new Date(date)
  },

  /**
   * Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   *     this.response.etag = 'md5hashsum'
   *     this.response.etag = '"md5hashsum"'
   *     this.response.etag = 'W/"123456789"'
   *
   * @param {String} etag
   * @api public
   */
  set etag (val) {
    this.set('etag', formatETag(val))
  },

  /**
   * Get the ETag of a response.
   *
   * @return {String}
   * @api public
   */
  get etag () {
    return this.get('etag')
  },

  /**
   * Return the request mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */
  get type () {
    var type = this.get('content-type')
    if (!type) return ''
    return type.split(';')[0]
  },

  /**
   * Check whether the response is one of the listed types.
   * Pretty much the same as `this.request.is()`.
   *
   * @param {String|Array} types...
   * @return {String|false}
   * @api public
   */
  is: function (types) {
    var type = this.type
    if (!types) return type || false
    if (!Array.isArray(types)) types = [].slice.call(arguments)
    return typeis(type, types)
  },

  /**
   * Return response header.
   *
   * Examples:
   *
   *     this.get('Content-Type')
   *     // => "text/plain"
   *
   *     this.get('content-type')
   *     // => "text/plain"
   *
   * @param {String} field
   * @return {String}
   * @api public
   */
  get: function (field) {
    return this.header[field.toLowerCase()] || ''
  },

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    this.set('Foo', ['bar', 'baz'])
   *    this.set('Accept', 'application/json')
   *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' })
   *
   * @param {String|Object|Array} field
   * @param {String} val
   * @api public
   */
  set: function (field, val) {
    if (arguments.length === 2) {
      if (Array.isArray(val)) val = val.map(String)
      else val = String(val)
      this.res.setHeader(field, val)
    } else {
      for (var key in field) {
        this.set(key, field[key])
      }
    }
  },

  /**
   * Append additional header `field` with value `val`.
   *
   * Examples:
   *
   *    this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>'])
   *    this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly')
   *    this.append('Warning', '199 Miscellaneous warning')
   *
   * @param {String} field
   * @param {String|Array} val
   * @api public
   */
  append: function (field, val) {
    var prev = this.get(field)
    if (prev) val = Array.isArray(prev) ? prev.concat(val) : [prev].concat(val)
    return this.set(field, val)
  },

  /**
   * Remove header `field`.
   *
   * @param {String} name
   * @api public
   */
  remove: function (field) {
    this.res.removeHeader(field)
  },

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */
  inspect: function () {
    var obj = this.toJSON()
    if (obj) obj.body = this.body
    return obj
  },

  /**
   * Return JSON representation.
   *
   * @return {Object}
   * @api public
   */
  toJSON: function () {
    return !this.res ? null : {
      status: this.status,
      message: this.message,
      header: this.header
    }
  }
}

function formatETag (val) {
  return /^(W\/)?"/.test(val) ? val : '"' + val + '"'
}
