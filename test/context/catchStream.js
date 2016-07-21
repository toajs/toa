'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
/*global describe, it */

var fs = require('fs')
var path = require('path')
var http = require('http')
var thunk = require('thunks')()
var Stream = require('stream')
var assert = require('assert')
var request = require('supertest')
var toa = require('../..')
var context = require('../context')

if (!Stream.prototype.listenerCount) {
  Stream.prototype.listenerCount = function (type) {
    return require('events').EventEmitter.listenerCount(this, type)
  }
}

describe('catch stream error', function () {
  it('should auto catch stream for body', function () {
    var ctx = context()
    var stream = new Stream.Readable()
    assert.strictEqual(stream.listenerCount('error'), 0)
    ctx.body = stream
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.strictEqual(stream.listeners('error')[0], stream.toaCleanHandle)
    stream.toaCleanHandle()
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.strictEqual(stream.listeners('error')[0], ctx.onerror)
  })

  it('should throw error when multi called', function () {
    var ctx = context()
    var stream = new Stream.Readable()
    assert.strictEqual(stream.listenerCount('error'), 0)
    stream.on('error', ctx.onerror)
    assert.strictEqual(stream.listenerCount('error'), 1)

    ctx.body = stream
    assert.throws(function () { ctx.catchStream(stream) })
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.strictEqual(stream.listeners('error')[0], stream.toaCleanHandle)

    stream.toaCleanHandle()
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.strictEqual(stream.listeners('error')[0], ctx.onerror)
  })

  it('should respond success', function () {
    var app = toa(function () {
      this.type = 'text'
      this.body = fs.createReadStream(path.join(__dirname, 'catchStream.js'), {
        encoding: 'utf8'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  it('should respond 404', function () {
    var app = toa(function () {
      this.type = 'text'
      this.body = fs.createReadStream(path.join(__dirname, 'none.js'), {
        encoding: 'utf8'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(404)
      .expect(function (res) {
        assert.strictEqual(res.res.statusMessage || res.res.text, 'Not Found')
      })
  })

  it('should destroy stream when request interrupted', function () {
    var destroyBody = false
    var app = toa(function () {
      var body = new Stream.PassThrough()
      var timer = setInterval(function () {
        body.write(new Buffer('...'))
      }, 20)
      body.destroy = function () {
        destroyBody = true
        clearInterval(timer)
      }
      this.body = body
    })

    var req = request(app.listen()).get('/')
    setTimeout(function () {
      req.abort()
    }, 200)

    return req.expect(200)
      .expect(function (res) {
        assert.strictEqual(destroyBody, true)
        assert.strictEqual(res.headers['content-type'], 'application/octet-stream')
      })
  })

  it('should work with keepAlive agent', function (done) {
    this.timeout(5000)
    var remote = toa(function () {
      this.body = 'hello!'
    })
    remote.listen()
    var address = remote.server.address()

    var socket = null
    var agent = new http.Agent({keepAlive: true, maxSockets: 1})
    var app = toa(function () {
      return requestRemote.call(this)(function (_, res) {
        if (socket) assert.strictEqual(socket, res.socket)
        else socket = res.socket

        assert.strictEqual(res.headers.connection, 'keep-alive')
        assert.strictEqual(res.headers['content-type'], 'text/plain; charset=utf-8')
        this.body = res
      })
    })
    var server = app.listen()

    thunk.all(
      request(server).get('/').expect(200),
      request(server).get('/').expect(200),
      request(server).get('/').expect(200)
    )(function (err, result) {
      if (err) throw err
      assert.strictEqual(result.length, 3)
      result.forEach(function (res) {
        assert.strictEqual(res.statusCode, 200)
        assert.strictEqual(res.headers['content-type'], 'application/octet-stream')
      })
    })(done)

    function requestRemote () {
      return thunk.call(this, function (callback) {
        var req = http.request({port: address.port, agent: agent}, function (res) {
          res.on('error', callback)
          res.on('data', function () {})
          res.on('end', function () {
            assert.strictEqual(res.statusCode, 200)
            callback(null, res)
          })
        })
        req.on('error', callback)
        req.end()
      })
    }
  })
})
