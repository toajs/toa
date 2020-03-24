'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('supertest')
const Toa = require('../..')

tman.suite('context events', function () {
  tman.suite('"end" event', function () {
    tman.it('should emit "end"', function (done) {
      let resEnd = false
      const app = new Toa()
      app.use(function () {
        this.body = 'test'
        assert.strictEqual(this.ended, false)
        this.on('end', function () {
          resEnd = !resEnd
          assert.strictEqual(this.ended, true)
        })
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          done()
        })
    })

    tman.it('should emit "end" while 404', function (done) {
      let resEnd = false
      const app = new Toa()
      app.use(function () {
        assert.strictEqual(this.ended, false)
        this.on('end', function () {
          resEnd = !resEnd
          assert.strictEqual(this.ended, true)
        })
        this.throw(404)
      })

      request(app.listen())
        .get('/')
        .expect(404)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          done()
        })
    })

    tman.it('should emit "end" while any error', function (done) {
      let resEnd = false
      const app = new Toa()
      app.use(function () {
        assert.strictEqual(this.ended, false)
        this.on('end', function () {
          resEnd = !resEnd
          assert.strictEqual(this.ended, true)
        })
        throw new Error('some error')
      })

      app.onerror = function () {}

      request(app.listen())
        .get('/')
        .expect(500)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          done()
        })
    })

    tman.it('should emit "end" if ctx.respond === false', function (done) {
      let resEnd = false
      const app = new Toa()
      app.use(function () {
        assert.strictEqual(this.ended, false)
        this.on('end', function () {
          resEnd = !resEnd
          assert.strictEqual(this.ended, true)
        })
        this.status = 200
        this.respond = false
        this.res.end('respond')
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          assert.strictEqual(res.text, 'respond')
          done()
        })
    })
  })

  tman.suite('"finish" event', function () {
    tman.it('should emit "finish"', function (done) {
      let finished = null
      const app = new Toa()
      app.use(function () {
        this.body = 'test'
        assert.strictEqual(this.finished, false)
        this.on('finish', function () {
          finished = this.finished
          assert.strictEqual(this.finished, true)
        })
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(finished, true)
          done()
        })
    })

    tman.it('should emit "finish" while 404', function (done) {
      let finished = null
      const app = new Toa()
      app.use(function () {
        assert.strictEqual(this.finished, false)
        this.on('finish', function () {
          finished = this.finished
          assert.strictEqual(this.finished, true)
        })
        this.throw(404)
      })

      request(app.listen())
        .get('/')
        .expect(404)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(finished, true)
          done()
        })
    })

    tman.it('should emit "finish" when process error', function (done) {
      let finished = null
      const app = new Toa()
      app.use(function () {
        assert.strictEqual(this.finished, false)
        this.on('finish', function () {
          finished = this.finished
          assert.strictEqual(this.finished, true)
        })
        throw new Error('some error')
      })

      app.onerror = function () {}

      request(app.listen())
        .get('/')
        .expect(500)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(finished, true)
          done()
        })
    })

    tman.it('should emit "finish" after "end"', function (done) {
      let ended = false
      let finished = null
      const app = new Toa()
      app.use(function () {
        this.on('finish', function () {
          assert.strictEqual(ended, true)
          finished = this.finished
        })
        this.on('end', function () {
          ended = !ended
        })
        this.body = 'body'
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert.strictEqual(res.text, 'body')
          assert.strictEqual(finished, true)
          done()
        })
    })
  })

  tman.suite('"close" event', function () {
    tman.it('should emit "close" when request destroy', function (done) {
      const app = new Toa()
      app.use(function (cb) {
        setTimeout(cb, 100)
        this.body = 'test'

        assert.strictEqual(this.closed, false)
        this.on('close', function () {
          // closed = this.closed
          assert.strictEqual(this.ended, false)
          assert.strictEqual(this.finished, false)
          assert.strictEqual(this.closed, true)
          done()
        })
        this.req.destroy('some error')
      })

      request(app.listen())
        .get('/')
        .end(function () {})
    })

    tman.it('should emit "close" when socket destroy', function (done) {
      const app = new Toa()
      app.use(function (cb) {
        setTimeout(cb, 100)
        this.body = 'test'

        assert.strictEqual(this.closed, false)
        this.on('close', function () {
          // closed = this.closed
          assert.strictEqual(this.ended, false)
          assert.strictEqual(this.finished, false)
          assert.strictEqual(this.closed, true)
          done()
        })
        this.socket.destroy('some error')
      })

      request(app.listen())
        .get('/')
        .end(function () {})
    })

    tman.it('should cancel process after "close" emited', function (done) {
      let called = false
      const app = new Toa()

      app.use(function (cb) {
        setTimeout(cb, 100)
        this.body = 'test'

        assert.strictEqual(this.closed, false)
        this.on('close', function () {
          assert.strictEqual(this.ended, false)
          assert.strictEqual(this.finished, false)
          assert.strictEqual(this.closed, true)
          setTimeout(function () {
            assert.strictEqual(called, false)
            done()
          }, 120)
        })

        var socket = this.socket
        setTimeout(function () {
          socket.destroy('some error')
        }, 20)
      })

      app.use(function () {
        called = true
      })

      request(app.listen())
        .get('/')
        .end(function () {})
    })
  })

  tman.it('should cancel process and respond when "error" event', function (done) {
    let error = null
    let called = false
    const app = new Toa()

    app.onerror = function (err) { error = err }
    app.use(function (cb) {
      setTimeout(cb, 100)
      this.body = 'test'

      this.on('finish', function () {
        assert.strictEqual(this.ended, true)
        assert.strictEqual(this.finished, true)
      })

      var ctx = this
      setTimeout(function () {
        ctx.emit('error', new Error('some error'))
      }, 20)
    })

    app.use(function () {
      called = true
    })

    request(app.listen())
      .get('/')
      .expect(500)
      .end(function (err, res) {
        if (err) return done(err)

        assert.strictEqual(error.message, 'some error')
        setTimeout(function () {
          assert.strictEqual(called, false)
          done()
        }, 200)
      })
  })
})
