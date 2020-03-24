'use strict'

const fs = require('fs')
const path = require('path')
const tman = require('tman')
const Stream = require('stream')
const assert = require('assert')
const request = require('supertest')
const Toa = require('../..')
const context = require('../context')

tman.suite('catch stream error', function () {
  tman.it('should auto catch stream for body', function () {
    const ctx = context()
    const stream = new Stream.Readable()
    assert.strictEqual(stream.listenerCount('error'), 0)
    ctx.body = stream
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.ok(ctx.getStreamCleanHandler(stream))
    stream.listeners('error')[0]()
    assert.strictEqual(stream.listenerCount('error'), 1)
    assert.strictEqual(stream.listeners('error')[0], ctx.onerror)
  })

  tman.it('should throw error when multi called', function () {
    const ctx = context()
    const stream = new Stream.Readable()
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
      const body = new Stream.PassThrough()
      const timer = setInterval(function () {
        body.write(Buffer.from('...'))
      }, 20)
      body.destroy = function () {
        destroyBody = true
        clearInterval(timer)
      }
      this.body = body
    })

    const req = request(app.listen()).get('/')
    setTimeout(function () {
      req.abort()
    }, 200)

    return req.expect(200)
      .expect(function (res) {
        assert.strictEqual(destroyBody, true)
        assert.strictEqual(res.headers['content-type'], 'application/octet-stream')
      })
  })
})
