'use strict'

const Stream = require('stream')
const toa = require('..')

exports = module.exports = function (req, res) {
  let socket = new Stream.Duplex()
  req = merge({
    headers: {},
    socket: socket,
    __proto__: Stream.Readable.prototype
  }, req)
  res = merge({
    _headers: {},
    socket: socket,
    __proto__: Stream.Writable.prototype
  }, res)
  res.getHeader = function (k) {
    return res._headers[k.toLowerCase()]
  }
  res.setHeader = function (k, v) {
    res._headers[k.toLowerCase()] = v
  }
  res.removeHeader = function (k, v) {
    delete res._headers[k.toLowerCase()]
  }
  let app = toa()
  return new app.Context(req, res)
}

exports.context = function (req, res) {
  return exports(req, res)
}

exports.request = function (req, res) {
  return exports(req, res).request
}

exports.response = function (req, res) {
  return exports(req, res).response
}

function merge (dst, src) {
  if (src) {
    Object.keys(src).forEach(function (key) {
      dst[key] = src[key]
    })
  }
  return dst
}
