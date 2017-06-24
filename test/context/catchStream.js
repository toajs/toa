'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')
const tman = require('tman')
const thunk = require('thunks')()
const Stream = require('stream')
const assert = require('assert')
const request = require('supertest')
const Toa = require('../..')
const context = require('../context')

tman.suite('catch stream error', function () {
  tman.it('should auto catch stream for body', function () {
    let ctx = context()
    let stream = new Stream.Readable()
    assert.strictEqual(stream.listenerCount('error'), 0)
    ctx.body = stream
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.ok(ctx.getStreamCleanHandler(stream))
    stream.listeners('error')[0]()
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.strictEqual(stream.listeners('error')[0], ctx.onerror)
  })

  tman.it('should throw error when multi called', function () {
    let ctx = context()
    let stream = new Stream.Readable()
    assert.strictEqual(stream.listenerCount('error'), 0)
    stream.on('error', ctx.onerror)
    assert.strictEqual(stream.listenerCount('error'), 1)

    ctx.body = stream
    assert.throws(function () { ctx.catchStream(stream) })
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.ok(ctx.getStreamCleanHandler(stream))

    stream.listeners('error')[0]()
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.strictEqual(stream.listeners('error')[0], ctx.onerror)
  })

  tman.it('should respond success', function () {
    const app = new Toa()
    app.use(function () {
      this.type = 'text'
      this.body = fs.createReadStream(path.join(__dirname, 'catchStream.js'), {
        encoding: 'utf8'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  tman.it('should respond 404', function () {
    const app = new Toa()
    app.use(function () {
      this.type = 'text'
      this.body = fs.createReadStream(path.join(__dirname, 'none.js'), {
        encoding: 'utf8'
      })
    })

    app.onerror = function () {}
    return request(app.listen())
      .get('/')
      .expect(404)
      .expect(function (res) {
        assert.strictEqual(res.res.statusMessage || res.res.text, 'Not Found')
      })
  })

  tman.it('should destroy stream when request interrupted', function () {
    let destroyBody = false
    const app = new Toa()
    app.use(function () {
      let body = new Stream.PassThrough()
      let timer = setInterval(function () {
        body.write(Buffer.from('...'))
      }, 20)
      body.destroy = function () {
        destroyBody = true
        clearInterval(timer)
      }
      this.body = body
    })

    let req = request(app.listen()).get('/')
    setTimeout(function () {
      req.abort()
    }, 200)

    return req.expect(200)
      .expect(function (res) {
        assert.strictEqual(destroyBody, true)
        assert.strictEqual(res.headers['content-type'], 'application/octet-stream')
      })
  })

  tman.it('should work with keepAlive agent', function (done) {
    this.timeout(5000)
    const remote = new Toa()
    remote.use(function () {
      this.body = 'hello!'
    })
    remote.listen()
    let address = remote.server.address()

    let socket = null
    let agent = new http.Agent({keepAlive: true, maxSockets: 1})
    const app = new Toa()
    app.use(function () {
      return requestRemote.call(this)(function (_, res) {
        if (socket) assert.strictEqual(socket, res.socket)
        else socket = res.socket

        assert.strictEqual(res.headers.connection, 'keep-alive')
        assert.strictEqual(res.headers['content-type'], 'text/plain; charset=utf-8')
        this.body = res
      })
    })
    const server = app.listen()

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
        let req = http.request({port: address.port, agent: agent}, function (res) {
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
