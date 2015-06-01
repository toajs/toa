'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var stderr = require('test-console').stderr
var request = require('supertest')
var statuses = require('statuses')
var assert = require('assert')
var toa = require('..')
var fs = require('fs')

describe('app', function () {
  it('should handle socket errors', function (done) {
    var app = toa(function () {
      this.socket.emit('error', new Error('boom'))
    })

    app.onerror = function (err) {
      assert(err.message, 'boom')
      app.server.close(done)
    }

    request(app.listen())
      .get('/')
      .end(function () {})
  })
})

describe('app.use(fn)', function () {
  it('should run middleware befor body', function (done) {
    var app = toa(function () {
      calls.push(3)
      return this.thunk(4)(function (err, res) {
        if (err) return
        calls.push(4)
        this.body = calls
      })
    })
    var calls = []

    app.use(function (next) {
      calls.push(1)
      return next()
    })

    app.use(function (next) {
      calls.push(2)
      return next()
    })

    request(app.listen())
      .get('/')
      .expect(function (res) {
        assert.deepEqual(res.body, [1, 2, 3, 4])
      })
      .end(done)
  })
})

describe('app.onerror(err)', function () {
  it('should do nothing if status is 404', function (done) {
    var app = toa()
    var err = new Error()

    err.status = 404

    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.deepEqual(output, [])
    done()
  })

  it('should log the error to stderr', function (done) {
    var app = toa()

    var err = new Error()
    err.stack = 'Foo'

    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.deepEqual(output, ['  Foo\n'])
    done()
  })
})

describe('app.respond', function () {
  describe('when this.respond === false', function () {
    it('should bypass app.respond', function (done) {
      var app = toa(function () {
        this.body = 'Hello'
        this.respond = false

        var res = this.res
        res.statusCode = 200
        setImmediate(function () {
          res.setHeader('content-type', 'text/plain')
          res.end('lol')
        })
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .expect('lol')
        .end(done)
    })
  })

  describe('when HEAD is used', function () {
    it('should not respond with the body', function (done) {
      var app = toa(function () {
        this.body = 'Hello'
      })

      request(app.listen())
        .head('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.header['content-type'] === 'text/plain; charset=utf-8')
          assert(res.header['content-length'] === '5')
          assert(res.text.length === 0)
          done()
        })
    })

    it('should keep json headers', function (done) {
      var app = toa(function () {
        this.body = {
          hello: 'world'
        }
      })

      request(app.listen())
        .head('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.header['content-type'] === 'application/json; charset=utf-8')
          assert(res.header['content-length'] === '17')
          assert(res.text.length === 0)
          done()
        })
    })

    it('should keep string headers', function (done) {
      var app = toa(function () {
        this.body = 'hello world'
      })

      var server = app.listen()

      request(server)
        .head('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.header['content-type'] === 'text/plain; charset=utf-8')
          assert(res.header['content-length'] === '11')
          assert(res.text.length === 0)
          done()
        })
    })

    it('should keep buffer headers', function (done) {
      var app = toa(function () {
        this.body = new Buffer('hello world')
      })

      request(app.listen())
        .head('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.header['content-type'] === 'application/octet-stream')
          assert(res.header['content-length'] === '11')
          assert(res.text.length === 0)
          done()
        })
    })

    it('should respond with a 404 if no body was set', function (done) {
      var app = toa(function () {})

      request(app.listen())
        .head('/')
        .expect(404, done)
    })

    it('should respond with a 200 if body = ""', function (done) {
      var app = toa(function () {
        this.body = ''
      })

      request(app.listen())
        .head('/')
        .expect(200, done)
    })

    it('should not overwrite the content-type', function (done) {
      var app = toa(function () {
        this.status = 200
        this.type = 'application/javascript'
      })

      request(app.listen())
        .head('/')
        .expect('content-type', /application\/javascript/)
        .expect(200, done)
    })
  })

  describe('when no middleware and no body are present', function () {
    it('should 404', function (done) {
      var app = toa()

      request(app.listen())
        .get('/')
        .expect(404, done)
    })
  })

  describe('when res has already been written to', function () {
    it('should not cause an app error', function (done) {
      var app = toa(function () {
        var res = this.res
        this.status = 200
        res.setHeader('content-type', 'text/html')
        res.write('Hello')
        setTimeout(function () {
          res.end('Goodbye')
        }, 0)
      })

      var errorCaught = false

      app.onerror = function (err) {
        errorCaught = err
      }

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          if (errorCaught) return done(errorCaught)
          done()
        })
    })

    it('should send the right body', function (done) {
      var app = toa(function () {
        var res = this.res
        this.status = 200
        res.setHeader('content-type', 'text/html')
        res.write('Hello')
        setTimeout(function () {
          res.end('Goodbye')
        }, 0)
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .expect('HelloGoodbye', done)
    })
  })

  describe('when .body is missing', function () {
    describe('with status=400', function () {
      it('should respond with the associated status message', function (done) {
        var app = toa(function () {
          this.status = 400
        })

        request(app.listen())
          .get('/')
          .expect(400)
          .expect('content-length', 11)
          .expect('Bad Request', done)
      })
    })

    describe('with status=204', function () {
      it('should respond without a body', function (done) {
        var app = toa(function () {
          this.status = 204
        })

        request(app.listen())
          .get('/')
          .expect(204)
          .expect('')
          .end(function (err, res) {
            if (err) return done(err)

            assert(res.header['content-type'] === undefined)
            done()
          })
      })
    })

    describe('with status=205', function () {
      it('should respond without a body', function (done) {
        var app = toa(function () {
          this.status = 205
        })

        request(app.listen())
          .get('/')
          .expect(205)
          .expect('')
          .end(function (err, res) {
            if (err) return done(err)

            assert(res.header['content-type'] === undefined)
            done()
          })
      })
    })

    describe('with status=304', function () {
      it('should respond without a body', function (done) {
        var app = toa(function () {
          this.status = 304
        })

        request(app.listen())
          .get('/')
          .expect(304)
          .expect('')
          .end(function (err, res) {
            if (err) return done(err)

            assert(res.header['content-type'] === undefined)
            done()
          })
      })
    })

    describe('with custom status=700', function () {
      it('should respond with the associated status message', function (done) {
        var app = toa()
        statuses['700'] = 'custom status'

        app.use(function (next) {
          this.status = 700
          return next()
        })

        request(app.listen())
          .get('/')
          .expect(700)
          .expect('custom status')
          .end(function (err, res) {
            if (err) return done(err)
            assert((res.res.statusMessage || res.res.text) === 'custom status')
            done()
          })
      })
    })

    describe('with custom statusMessage=ok', function () {
      it('should respond with the custom status message', function (done) {
        var app = toa()

        app.use(function (next) {
          this.status = 200
          this.message = 'ok'
          return next()
        })

        request(app.listen())
          .get('/')
          .expect(200)
          .expect('ok')
          .end(function (err, res) {
            if (err) return done(err)
            assert((res.res.statusMessage || res.res.text) === 'ok')
            done()
          })
      })
    })

    describe('with custom status without message', function () {
      it('should respond with the status code number', function (done) {
        var app = toa()

        app.use(function (next) {
          this.res.statusCode = 701
          return next()
        })

        request(app.listen())
          .get('/')
          .expect(701)
          .expect('701', done)
      })
    })
  })

  describe('when .body is a null', function () {
    it('should respond 204 by default', function (done) {
      var app = toa(function () {
        this.body = null
      })

      request(app.listen())
        .get('/')
        .expect(204)
        .expect('')
        .end(function (err, res) {
          if (err) return done(err)

          assert(res.header['content-type'] === undefined)
          done()
        })
    })

    it('should respond 204 with status=200', function (done) {
      var app = toa(function () {
        this.status = 200
        this.body = null
      })

      request(app.listen())
        .get('/')
        .expect(204)
        .expect('')
        .end(function (err, res) {
          if (err) return done(err)

          assert(res.header['content-type'] === undefined)
          done()
        })
    })

    it('should respond 205 with status=205', function (done) {
      var app = toa(function () {
        this.status = 205
        this.body = null
      })

      request(app.listen())
        .get('/')
        .expect(205)
        .expect('')
        .end(function (err, res) {
          if (err) return done(err)

          assert(res.header['content-type'] === undefined)
          done()
        })
    })

    it('should respond 304 with status=304', function (done) {
      var app = toa(function () {
        this.status = 304
        this.body = null
      })

      request(app.listen())
        .get('/')
        .expect(304)
        .expect('')
        .end(function (err, res) {
          if (err) return done(err)

          assert(res.header['content-type'] === undefined)
          done()
        })
    })
  })

  describe('when .body is a string', function () {
    it('should respond', function (done) {
      var app = toa(function () {
        this.body = 'Hello'
      })

      request(app.listen())
        .get('/')
        .expect('Hello', done)
    })
  })

  describe('when .body is a Buffer', function () {
    it('should respond', function (done) {
      var app = toa(function () {
        this.body = new Buffer('Hello')
      })

      request(app.listen())
        .get('/')
        .expect('Hello', done)
    })
  })

  describe('when .body is a Stream', function () {
    it('should respond', function (done) {
      var app = toa(function () {
        this.body = fs.createReadStream('package.json')
        this.set('content-type', 'application/json; charset=utf-8')
      })

      request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) return done(err)
          var pkg = require('../package')
          assert(res.header['content-length'] === undefined)
          assert.deepEqual(res.body, pkg)
          done()
        })
    })

    it('should strip content-length when overwriting', function (done) {
      var app = toa(function () {
        this.body = 'hello'
        this.body = fs.createReadStream('package.json')
        this.set('content-type', 'application/json; charset=utf-8')
      })

      request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) return done(err)
          var pkg = require('../package')
          assert(res.header['content-length'] === undefined)
          assert.deepEqual(res.body, pkg)
          done()
        })
    })

    it('should keep content-length if not overwritten', function (done) {
      var app = toa(function () {
        this.length = fs.readFileSync('package.json').length
        this.body = fs.createReadStream('package.json')
        this.set('content-type', 'application/json; charset=utf-8')
      })

      request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) return done(err)
          var pkg = require('../package')
          assert(res.header['content-length'] > 0)
          assert.deepEqual(res.body, pkg)
          done()
        })
    })

    it('should keep content-length if overwritten with the same stream', function (done) {
      var app = toa(function () {
        this.length = fs.readFileSync('package.json').length
        var stream = fs.createReadStream('package.json')
        this.body = stream
        this.body = stream
        this.set('content-type', 'application/json; charset=utf-8')
      })

      request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .end(function (err, res) {
          if (err) return done(err)
          var pkg = require('../package')
          assert(res.header['content-length'] > 0)
          assert.deepEqual(res.body, pkg)
          done()
        })
    })

    it('should handle errors', function (done) {
      var app = toa(function () {
        this.set('content-type', 'application/json; charset=utf-8')
        this.body = fs.createReadStream('does not exist')
      })

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/plain; charset=utf-8')
        .expect(404)
        .end(done)
    })

    it('should handle errors when no content status', function (done) {
      var app = toa(function () {
        this.status = 204
        this.body = fs.createReadStream('does not exist1')
      })

      request(app.listen())
        .get('/')
        .expect(204)
        .end(done)
    })

    it('should handle all intermediate stream body errors', function (done) {
      var app = toa(function () {
        this.body = fs.createReadStream('does not exist2')
        this.body = fs.createReadStream('does not exist3')
        this.body = fs.createReadStream('does not exist4')
      })

      request(app.listen())
        .get('/')
        .expect('content-type', 'text/plain; charset=utf-8')
        .expect(404)
        .end(done)
    })
  })

  describe('when .body is an Object', function () {
    it('should respond with json', function (done) {
      var app = toa(function () {
        this.body = {
          hello: 'world'
        }
      })

      request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .expect('{"hello":"world"}', done)
    })
  })

  describe('when an error occurs', function () {
    it('should emit "error" on the app', function (done) {
      var app = toa(function () {
        throw new Error('boom')
      })

      app.onerror = function (err) {
        assert(err.message, 'boom')
        done()
      }

      request(app.listen())
        .get('/')
        .end(function () {})
    })

    describe('with an .expose property', function () {
      it('should expose the message', function (done) {
        var app = toa(function () {
          var err = new Error('sorry!')
          err.status = 403
          err.expose = true
          throw err
        })

        app.onerror = function (err) {
          assert(err.message, 'sorry!')
        }

        request(app.listen())
          .get('/')
          .expect(403, 'sorry!')
          .end(done)
      })
    })

    describe('with a .status property', function () {
      it('should respond with .status', function (done) {
        var app = toa(function () {
          var err = new Error('s3 explodes')
          err.status = 403
          throw err
        })

        request(app.listen())
          .get('/')
          .expect(403, 'Forbidden')
          .end(done)
      })
    })

    it('should respond with 500', function (done) {
      var app = toa(function () {
        throw new Error('boom!')
      })

      app.onerror = function (err) {
        assert(err.message === 'boom!')
      }

      request(app.listen())
        .get('/')
        .expect(500, 'Internal Server Error')
        .end(done)
    })

    it('should be catchable', function (done) {
      var app = toa(function () {
        this.body = 'Got something'
      }, function (err) {
        assert(err.message, 'boom!')
        this.body = 'Got error'
        return true
      })

      app.use(function () {
        throw new Error('boom!')
      })

      request(app.listen())
        .get('/')
        .expect(200, 'Got error')
        .end(done)
    })
  })

  describe('when status and body property', function () {
    it('should 200', function (done) {
      var app = toa(function () {
        this.status = 304
        this.body = 'hello'
        this.status = 200
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .expect('hello', done)
    })

    it('should 204', function (done) {
      var app = toa(function () {
        this.status = 200
        this.body = 'hello'
        this.set('content-type', 'text/plain; charset=utf8')
        this.status = 204
      })

      request(app.listen())
        .get('/')
        .expect(204)
        .end(function (err, res) {
          assert(res.header['content-type'] === undefined)
          done(err)
        })
    })
  })
})

describe('app.context', function () {
  var app1 = toa()
  app1.context.msg = 'hello'
  var app2 = toa()

  it('should merge properties', function (done) {
    app1.use(function (next) {
      assert.strictEqual(this.msg, 'hello')
      this.status = 204
      return next()
    })

    request(app1.listen())
      .get('/')
      .expect(204, done)
  })

  it('should not affect the original prototype', function (done) {
    app2.use(function (next) {
      assert.strictEqual(this.msg, undefined)
      this.status = 204
      return next()
    })

    request(app2.listen())
      .get('/')
      .expect(204, done)
  })

  it('should not affect the application config', function (done) {
    var app = toa(function () {
      assert(this.config.test === 'config')
      assert(this.config.poweredBy === 'x')
      this.config.poweredBy = 'test'
      this.status = 204
      assert(this.config.poweredBy === 'test')
      assert(app.config.poweredBy === 'x')
    })

    app.config = {
      test: 'config',
      poweredBy: 'x'
    }

    request(app.listen())
      .get('/')
      .expect(204, done)
  })
})

describe('app.request', function () {
  var app1 = toa()
  app1.request.message = 'hello'
  var app2 = toa()

  it('should merge properties', function (done) {
    app1.use(function (next) {
      assert.strictEqual(this.request.message, 'hello')
      this.status = 204
      return next()
    })

    request(app1.listen())
      .get('/')
      .expect(204, done)
  })

  it('should not affect the original prototype', function (done) {
    app2.use(function (next) {
      assert.strictEqual(this.request.message, undefined)
      this.status = 204
      return next()
    })

    request(app2.listen())
      .get('/')
      .expect(204, done)
  })
})

describe('app.response', function () {
  var app1 = toa()
  app1.response.msg = 'hello'
  var app2 = toa()

  it('should merge properties', function (done) {
    app1.use(function (next) {
      assert.strictEqual(this.response.msg, 'hello')
      this.status = 204
      return next()
    })

    request(app1.listen())
      .get('/')
      .expect(204, done)
  })

  it('should not affect the original prototype', function (done) {
    app2.use(function (next) {
      assert.strictEqual(this.response.msg, undefined)
      this.status = 204
      return next()
    })

    request(app2.listen())
      .get('/')
      .expect(204, done)
  })
})
