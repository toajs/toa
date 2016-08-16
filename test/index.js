'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/* global suite, it */

var net = require('net')
var Stream = require('stream')
var stderr = require('test-console').stderr
var request = require('supertest')
var statuses = require('statuses')
var assert = require('assert')
var http = require('http')
var toa = require('..')
var fs = require('fs')

suite('app', function () {
  it('should finished when socket errors', function (done) {
    var app = toa(function () {
      this.on('close', function () {
        assert.strictEqual(this._finished, false)
        assert.strictEqual(this.headerSent, false)
        app.server.close(done)
      })
      this.on('finish', function () {
        throw new Error('should not run')
      })
      this.socket.emit('error', new Error('boom'))
      return this.thunk.delay(100)
    })

    app.onerror = function () {
      throw new Error('should not run')
    }

    request(app.listen())
      .get('/')
      .end(function () {})
  })

  it('should work with custom server', function () {
    var server = http.createServer()
    var app = toa(server, function () {
      this.body = 'hello'
    })

    assert.strictEqual(app.server, server)

    return request(app.listen())
      .get('/')
      .expect('hello')
  })

  it('should work with error handle', function () {
    var app = toa(function () {
      this.throw(404)
    }, function (err) {
      this.body = 'hello'
      assert.strictEqual(err.status, 404)
      return true
    })

    return request(app.listen())
      .get('/')
      .expect('hello')
  })

  it('should throw errorHandle\'s error', function (done) {
    var app = toa(function () {
      this.throw(404)
    }, function (err) {
      if (err) throw new Error('errorHandle error')
    })

    var handleErr = null

    app.onerror = function (error) {
      handleErr = error
    }

    request(app.listen())
      .get('/')
      .expect(500)
      .end(function (err) {
        assert.strictEqual(handleErr.message, 'errorHandle error')
        done(err)
      })
  })

  it('should work with error handle', function () {
    var app = toa(function () {
      this.throw(404)
    }, function (err) {
      this.body = 'hello'
      assert.strictEqual(err.status, 404)
      return true
    })

    return request(app.listen())
      .get('/')
      .expect('hello')
  })

  it('error should have headerSent when occured after send', function (done) {
    var app = toa(function () {
      this.body = 'hello'
      this.thunk.delay.call(this, 100)(function () {
        this.throw(500)
      })
    })

    app.onerror = function (err) {
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.headerSent, true)
      assert.strictEqual(err.context.request instanceof Object, true)
      assert.strictEqual(err.context.response instanceof Object, true)
      done()
    }

    return request(app.listen())
      .get('/')
      .expect(200)
      .end(function () {})
  })

  it('should respond non-error by onResError', function () {
    var app = toa(function () {
      this.body = 123
      var obj = {
        message: 'some message',
        status: 206
      }
      throw obj
    })

    return request(app.listen())
      .get('/')
      .expect(206)
      .expect({
        message: 'some message',
        status: 206
      })
  })

  it('should work with options', function (done) {
    var debugLogs = 0
    var app = toa(function () {
      this.throw(404)
    }, {
      onerror: function (err) {
        this.body = 'hello'
        assert.strictEqual(err.status, 404)
      },
      debug: function (err, res) {
        debugLogs += 1
        if (err) assert.strictEqual(err.status, 404)
      }
    })

    request(app.listen())
      .get('/')
      .expect(404)
      .end(function (err) {
        assert.strictEqual(debugLogs >= 1, true)
        done(err)
      })
  })

  it('should work with pipeling request', function (done) {
    var socket = null
    var count = 0

    var server = toa(function () {
      this.body = String(++count)
      if (!socket) socket = this.socket
      else assert.strictEqual(this.socket, socket)
      assert.strictEqual(socket.listenerCount('error'), 1)
    }).listen()

    var bufs = []
    var port = server.address().port
    var buf = new Buffer('GET / HTTP/1.1\r\nHost: localhost:' +
      port + '\r\nConnection: keep-alive\r\n\r\n')
    var client = net.connect(server.address().port)
      .on('error', done)
      .on('data', function (buf) {
        bufs.push(buf)
      })
      .on('close', function () {
        assert.strictEqual(count, 5)
        var res = Buffer.concat(bufs).toString()
        assert.strictEqual(res.match(/HTTP\/1\.1 200 OK/g).length, 5)
        assert.strictEqual(res[res.length - 1], '5')
        done()
      })
    setTimeout(function () { client.write(buf) })
    setTimeout(function () { client.write(buf) })
    setTimeout(function () { client.write(buf) })
    setTimeout(function () { client.write(buf) }, 20)
    setTimeout(function () { client.write(buf) }, 50)
    setTimeout(function () { client.end() }, 100)
  })
})

suite('app.use(fn)', function () {
  it('should throw error with non-function middleware', function (done) {
    var app = toa()
    assert.throws(function () {
      app.use({})
    })
    done()
  })

  it('should run middleware befor body', function () {
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

    return request(app.listen())
      .get('/')
      .expect(function (res) {
        assert.deepEqual(res.body, [1, 2, 3, 4])
      })
  })

  it('should support more middleware function styles', function () {
    var app = toa()

    app.use(function (next) {
      this.state.count = 0
      next()
    })

    app.use(function () {
      this.state.count++
    })

    app.use(function () {
      this.state.count++
      return function (done) {
        var ctx = this
        setTimeout(function () {
          ctx.state.count++
          done()
        })
      }
    })

    app.use(function () {
      var ctx = this
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          ctx.state.count++
          resolve()
        })
      })
    })

    app.use(function () {
      this.body = this.state
    })

    return request(app.listen())
      .get('/')
      .expect(function (res) {
        assert.deepEqual(res.body, {count: 4})
      })
  })
})

suite('app.onerror(err)', function () {
  it('should do nothing if status is 404', function () {
    var app = toa()
    var err = new Error()

    err.status = 404

    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.deepEqual(output, [])
  })

  it('should log the error to stderr', function () {
    var app = toa()

    var err = new Error()
    err.stack = 'Foo'

    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.deepEqual(output, ['  Foo\n'])
  })

  it('should transform non-error to error object', function () {
    var app = toa()

    var err = 'Foo'
    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.strictEqual(output[0].indexOf('  Error: non-error thrown: \'Foo\'\n'), 0)
  })
})

suite('app.respond', function () {
  suite('when this.respond === false', function () {
    it('should bypass app.respond', function () {
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

      return request(app.listen())
        .get('/')
        .expect(200)
        .expect('lol')
    })
  })

  suite('when HEAD is used', function () {
    it('should not respond with the body', function () {
      var app = toa(function () {
        this.body = 'Hello'
      })

      return request(app.listen())
        .head('/')
        .expect(200)
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], 'text/plain; charset=utf-8')
          assert.strictEqual(res.header['content-length'], '5')
          assert.strictEqual(res.text.length, 0)
        })
    })

    it('should keep json headers', function () {
      var app = toa(function () {
        this.body = {
          hello: 'world'
        }
      })

      return request(app.listen())
        .head('/')
        .expect(200)
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], 'application/json; charset=utf-8')
          assert.strictEqual(res.header['content-length'], '17')
          assert.strictEqual(res.text.length, 0)
        })
    })

    it('should keep string headers', function () {
      var app = toa(function () {
        this.body = 'hello world'
      })

      return request(app.listen())
        .head('/')
        .expect(200)
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], 'text/plain; charset=utf-8')
          assert.strictEqual(res.header['content-length'], '11')
          assert.strictEqual(res.text.length, 0)
        })
    })

    it('should keep buffer headers', function () {
      var app = toa(function () {
        this.body = new Buffer('hello world')
      })

      return request(app.listen())
        .head('/')
        .expect(200)
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], 'application/octet-stream')
          assert.strictEqual(res.header['content-length'], '11')
          assert.strictEqual(res.text.length, 0)
        })
    })

    it('should respond with a 404 if no body was set', function () {
      var app = toa(function () {})

      return request(app.listen())
        .head('/')
        .expect(404)
    })

    it('should respond with a 200 if body = ""', function () {
      var app = toa(function () {
        this.body = ''
      })

      return request(app.listen())
        .head('/')
        .expect(200)
    })

    it('should not overwrite the content-type', function () {
      var app = toa(function () {
        this.status = 200
        this.type = 'application/javascript'
      })

      return request(app.listen())
        .head('/')
        .expect('content-type', /application\/javascript/)
        .expect(200)
    })

    it('should not send Content-Type header', function (done) {
      var app = toa(function () {
        this.body = ''
        this.type = null
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert.strictEqual(res.header['content-type'], undefined)
          done()
        })
    })
  })

  suite('when no middleware and no body are present', function () {
    it('should 404', function () {
      var app = toa()

      return request(app.listen())
        .get('/')
        .expect(404)
    })
  })

  suite('when res has already been written to', function () {
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

    it('should send the right body', function () {
      var app = toa(function () {
        var res = this.res
        this.status = 200
        res.setHeader('content-type', 'text/html')
        res.write('Hello')
        setTimeout(function () {
          res.end('Goodbye')
        }, 0)
      })

      return request(app.listen())
        .get('/')
        .expect(200)
        .expect('HelloGoodbye')
    })
  })

  suite('when .body is missing', function () {
    suite('with status=400', function () {
      it('should respond with the associated status message', function () {
        var app = toa(function () {
          this.status = 400
        })

        return request(app.listen())
          .get('/')
          .expect(400)
          .expect('content-length', '11')
          .expect('Bad Request')
      })
    })

    suite('with status=204', function () {
      it('should respond without a body', function () {
        var app = toa(function () {
          this.status = 204
        })

        return request(app.listen())
          .get('/')
          .expect(204)
          .expect('')
          .expect(function (res) {
            assert.strictEqual(res.header['content-type'], undefined)
          })
      })
    })

    suite('with status=205', function () {
      it('should respond without a body', function () {
        var app = toa(function () {
          this.status = 205
        })

        return request(app.listen())
          .get('/')
          .expect(205)
          .expect('')
          .expect(function (res) {
            assert.strictEqual(res.header['content-type'], undefined)
          })
      })
    })

    suite('with status=304', function () {
      it('should respond without a body', function () {
        var app = toa(function () {
          this.status = 304
        })

        return request(app.listen())
          .get('/')
          .expect(304)
          .expect('')
          .expect(function (res) {
            assert.strictEqual(res.header['content-type'], undefined)
          })
      })
    })

    suite('with custom status=700', function () {
      it('should respond with the associated status message', function () {
        var app = toa()
        statuses['700'] = 'custom status'

        app.use(function (next) {
          this.status = 700
          return next()
        })

        return request(app.listen())
          .get('/')
          .expect(700)
          .expect('custom status')
          .expect(function (res) {
            assert.strictEqual((res.res.statusMessage || res.res.text), 'custom status')
          })
      })
    })

    suite('with custom statusMessage=ok', function () {
      it('should respond with the custom status message', function () {
        var app = toa()

        app.use(function (next) {
          this.status = 200
          this.message = 'ok'
          return next()
        })

        return request(app.listen())
          .get('/')
          .expect(200)
          .expect('ok')
          .expect(function (res) {
            assert.strictEqual((res.res.statusMessage || res.res.text), 'ok')
          })
      })
    })

    suite('with custom status without message', function () {
      it('should respond with the status code number', function () {
        var app = toa()

        app.use(function (next) {
          this.res.statusCode = 701
          return next()
        })

        return request(app.listen())
          .get('/')
          .expect(701)
          .expect('701')
      })
    })
  })

  suite('when .body is a null', function () {
    it('should respond 204 by default', function () {
      var app = toa(function () {
        this.body = null
      })

      return request(app.listen())
        .get('/')
        .expect(204)
        .expect('')
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], undefined)
        })
    })

    it('should respond 204 with status=200', function () {
      var app = toa(function () {
        this.status = 200
        this.body = null
      })

      return request(app.listen())
        .get('/')
        .expect(204)
        .expect('')
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], undefined)
        })
    })

    it('should respond 205 with status=205', function () {
      var app = toa(function () {
        this.status = 205
        this.body = null
      })

      return request(app.listen())
        .get('/')
        .expect(205)
        .expect('')
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], undefined)
        })
    })

    it('should respond 304 with status=304', function () {
      var app = toa(function () {
        this.status = 304
        this.body = null
      })

      return request(app.listen())
        .get('/')
        .expect(304)
        .expect('')
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], undefined)
        })
    })
  })

  suite('when .body is a string', function () {
    it('should respond', function () {
      var app = toa(function () {
        this.body = 'Hello'
      })

      return request(app.listen())
        .get('/')
        .expect('Hello')
    })
  })

  suite('when .body is a Buffer', function () {
    it('should respond', function () {
      var app = toa(function () {
        this.body = new Buffer('Hello')
      })

      return request(app.listen())
        .get('/')
        .expect('Hello')
    })
  })

  suite('when .body is a Stream', function () {
    it('should respond', function () {
      var app = toa(function () {
        this.body = fs.createReadStream('package.json')
        this.set('content-type', 'application/json; charset=utf-8')
        this.on('end', function () {
          assert.strictEqual(this.headerSent, true)
        })
      })

      return request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .expect(function (res) {
          var pkg = require('../package')
          assert.strictEqual(res.header['content-length'], undefined)
          assert.deepEqual(res.body, pkg)
        })
    })

    it('should strip content-length when overwriting', function () {
      var app = toa(function () {
        this.body = 'hello'
        this.body = fs.createReadStream('package.json')
        this.set('content-type', 'application/json; charset=utf-8')
      })

      return request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .expect(function (res) {
          var pkg = require('../package')
          assert.strictEqual(res.header['content-length'], undefined)
          assert.deepEqual(res.body, pkg)
        })
    })

    it('should keep content-length if not overwritten', function () {
      var app = toa(function () {
        this.length = fs.readFileSync('package.json').length
        this.body = fs.createReadStream('package.json')
        this.set('content-type', 'application/json; charset=utf-8')
      })

      return request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .expect(function (res) {
          var pkg = require('../package')
          assert.strictEqual(res.header['content-length'] > 0, true)
          assert.deepEqual(res.body, pkg)
        })
    })

    it('should keep content-length if overwritten with the same stream', function () {
      var app = toa(function () {
        this.length = fs.readFileSync('package.json').length
        var stream = fs.createReadStream('package.json')
        this.body = stream
        this.body = stream
        this.set('content-type', 'application/json; charset=utf-8')
      })

      return request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .expect(function (res) {
          var pkg = require('../package')
          assert.strictEqual(res.header['content-length'] > 0, true)
          assert.deepEqual(res.body, pkg)
        })
    })

    it('should handle errors', function () {
      var app = toa(function () {
        this.set('content-type', 'application/json; charset=utf-8')
        this.body = fs.createReadStream('does not exist')
        this.on('end', function () {
          assert.strictEqual(this.headerSent, true)
        })
      })

      return request(app.listen())
        .get('/')
        .expect('content-type', 'text/plain; charset=utf-8')
        .expect(404)
    })

    it('should handle errors when no content status', function () {
      var app = toa(function () {
        this.status = 204
        this.body = fs.createReadStream('does not exist1')
      })

      return request(app.listen())
        .get('/')
        .expect(204)
    })

    it('should handle all intermediate stream body errors', function () {
      var app = toa(function () {
        this.body = fs.createReadStream('does not exist2')
        this.body = fs.createReadStream('does not exist3')
        this.body = fs.createReadStream('does not exist4')
      })

      return request(app.listen())
        .get('/')
        .expect('content-type', 'text/plain; charset=utf-8')
        .expect(404)
    })

    it('should destroy stream after respond', function (done) {
      var stream = new Stream.Readable()

      stream.destroy = function () {
        done()
      }

      stream._read = function () {
        this.push(null)
      }

      var app = toa(function () {
        this.body = stream
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err) {
          if (err) done(err)
        })
    })

    it('should destroy stream when response has a error', function (done) {
      var stream = new Stream.Readable()

      stream.destroy = done
      stream._read = function () {
        this.push('1')
      }

      var app = toa(function () {
        this.body = stream
      })

      app.onerror = function (err) {
        assert.strictEqual(err.headerSent, true)
        done()
      }
      http.get(app.listen().address(), function (res) {
        res.destroy()
      })
    })
  })

  suite('when .body is an Object', function () {
    it('should respond with json', function () {
      var app = toa(function () {
        this.body = {
          hello: 'world'
        }
      })

      return request(app.listen())
        .get('/')
        .expect('content-type', 'application/json; charset=utf-8')
        .expect('{"hello":"world"}')
    })
  })

  suite('when an error occurs', function () {
    it('should emit "error" on the app', function (done) {
      var app = toa(function () {
        throw new Error('boom')
      })

      app.onerror = function (err) {
        assert.strictEqual(err.message, 'boom')
        done()
      }

      request(app.listen())
        .get('/')
        .end(function () {})
    })

    suite('with an .expose property', function () {
      it('should expose the message', function () {
        var app = toa(function () {
          var err = new Error('sorry!')
          err.status = 403
          err.expose = true
          throw err
        })

        app.onerror = function (err) {
          assert.strictEqual(err.message, 'sorry!')
        }

        return request(app.listen())
          .get('/')
          .expect(403, 'sorry!')
      })
    })

    suite('with a .status property', function () {
      it('should respond with .status', function () {
        var app = toa(function () {
          var err = new Error('s3 explodes')
          err.status = 403
          throw err
        })

        return request(app.listen())
          .get('/')
          .expect(403, 'Forbidden')
      })
    })

    it('should respond with 500', function () {
      var app = toa(function () {
        throw new Error('boom!')
      })

      app.onerror = function (err) {
        assert.strictEqual(err.message, 'boom!')
      }

      return request(app.listen())
        .get('/')
        .expect(500, 'Internal Server Error')
    })

    it('should be catchable', function () {
      var app = toa(function () {
        this.body = 'Got something'
      }, function (err) {
        assert.strictEqual(err.message, 'boom!')
        this.body = 'Got error'
        return true
      })

      app.use(function (done) {
        throw new Error('boom!')
      })

      return request(app.listen())
        .get('/')
        .expect(200, 'Got error')
    })

    it('should retain "Accept" headers', function () {
      var app = toa(function () {
        this.set('Accept', 'text/plain')
        this.throw(400)
      })

      return request(app.listen())
        .get('/')
        .expect(400)
        .expect(function (res) {
          assert.strictEqual(res.headers['accept'], 'text/plain')
        })
    })

    it('should retain "Allow" headers', function () {
      var app = toa(function () {
        this.set('Allow', 'GET, HEAD')
        this.throw(405)
      })

      return request(app.listen())
        .get('/')
        .expect(405)
        .expect(function (res) {
          assert.strictEqual(res.headers['allow'], 'GET, HEAD')
        })
    })

    it('should retain "Retry-After" headers', function () {
      var app = toa(function () {
        this.set('Retry-After', '120')
        this.throw(429)
      })

      return request(app.listen())
        .get('/')
        .expect(429)
        .expect(function (res) {
          assert.strictEqual(res.headers['retry-after'], '120')
        })
    })

    it('should retain "Warning" headers', function () {
      var app = toa(function () {
        this.set('Warning', '199 Miscellaneous warning')
        this.throw(400)
      })

      return request(app.listen())
        .get('/')
        .expect(400)
        .expect(function (res) {
          assert.strictEqual(res.headers['warning'], '199 Miscellaneous warning')
        })
    })

    it('should retain CORS headers', function () {
      var app = toa(function () {
        this.set('Access-Control-Allow-Credentials', 'true')
        this.set('Access-Control-Allow-Origin', '*')
        this.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, HEAD, OPTIONS')
        this.body = 'Got something'
        this.throw(400)
      })

      return request(app.listen())
        .get('/')
        .expect(400)
        .expect(function (res) {
          assert.strictEqual(res.headers['access-control-allow-credentials'], 'true')
          assert.strictEqual(res.headers['access-control-allow-origin'], '*')
          assert.strictEqual(res.headers['access-control-allow-methods'], 'GET, POST, DELETE, HEAD, OPTIONS')
        })
    })
  })

  suite('when status and body property', function () {
    it('should 200', function () {
      var app = toa(function () {
        this.status = 304
        this.body = 'hello'
        this.status = 200
      })

      return request(app.listen())
        .get('/')
        .expect(200)
        .expect('hello')
    })

    it('should 204', function () {
      var app = toa(function () {
        this.status = 200
        this.body = 'hello'
        this.set('content-type', 'text/plain; charset=utf8')
        this.status = 204
      })

      return request(app.listen())
        .get('/')
        .expect(204)
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'], undefined)
        })
    })
  })
})

suite('app.context', function () {
  var app1 = toa()
  app1.context.msg = 'hello'
  var app2 = toa()

  it('should merge properties', function () {
    app1.use(function (next) {
      assert.strictEqual(this.msg, 'hello')
      this.status = 204
      return next()
    })

    return request(app1.listen())
      .get('/')
      .expect(204)
  })

  it('should not affect the original prototype', function () {
    app2.use(function (next) {
      assert.strictEqual(this.msg, undefined)
      this.status = 204
      return next()
    })

    return request(app2.listen())
      .get('/')
      .expect(204)
  })

  it('should throw error with non-object config', function () {
    var app = toa()

    assert.throws(function () {
      app.config = []
    })
    assert.strictEqual(app.config.poweredBy, 'Toa')
  })

  it('should not affect the application config', function () {
    var app = toa(function () {
      assert.strictEqual(this.config.test, 'config')
      assert.strictEqual(this.config.poweredBy, 'x')
      this.config.poweredBy = 'test'
      this.status = 204
      assert.strictEqual(this.config.poweredBy, 'test')
      assert.strictEqual(app.config.poweredBy, 'x')
    })

    app.config = {
      test: 'config',
      poweredBy: 'x'
    }

    return request(app.listen())
      .get('/')
      .expect(204)
  })
})

suite('app.request', function () {
  var app1 = toa()
  app1.request.message = 'hello'
  var app2 = toa()

  it('should merge properties', function () {
    app1.use(function (next) {
      assert.strictEqual(this.request.message, 'hello')
      this.status = 204
      return next()
    })

    return request(app1.listen())
      .get('/')
      .expect(204)
  })

  it('should not affect the original prototype', function () {
    app2.use(function (next) {
      assert.strictEqual(this.request.message, undefined)
      this.status = 204
      return next()
    })

    return request(app2.listen())
      .get('/')
      .expect(204)
  })
})

suite('app.response', function () {
  var app1 = toa()
  app1.response.msg = 'hello'
  var app2 = toa()

  it('should merge properties', function () {
    app1.use(function (next) {
      assert.strictEqual(this.response.msg, 'hello')
      this.status = 204
      return next()
    })

    return request(app1.listen())
      .get('/')
      .expect(204)
  })

  it('should not affect the original prototype', function () {
    app2.use(function (next) {
      assert.strictEqual(this.response.msg, undefined)
      this.status = 204
      return next()
    })

    return request(app2.listen())
      .get('/')
      .expect(204)
  })
})
