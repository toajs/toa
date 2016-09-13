'use strict'

var fs = require('fs')
var net = require('net')
var tman = require('tman')
var http = require('http')
var assert = require('assert')
var Stream = require('stream')
var request = require('supertest')
var statuses = require('statuses')
var stderr = require('test-console').stderr
var toa = require('..')

tman.suite('app', function () {
  tman.it('should finished when socket errors', function (done) {
    var app = toa(function () {
      this.on('close', function () {
        assert.strictEqual(this.finished, false)
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

  tman.it('should work with custom server', function () {
    var server = http.createServer()
    var app = toa(server, function () {
      this.body = 'hello'
    })

    assert.strictEqual(app.server, server)

    return request(app.listen())
      .get('/')
      .expect('hello')
  })

  tman.it('should work with error handle', function () {
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

  tman.it('should throw errorHandle\'s error', function (done) {
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

  tman.it('should work with error handle', function () {
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

  tman.it('error should have headerSent when occured after send', function (done) {
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

  tman.it('should respond non-error by onResError', function () {
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

  tman.it('should respond non-error-400', function () {
    var app = toa({
      onerror: function (err) {
        return {status: err.status, name: err.name, message: 'Invalid params'}
      }
    })

    app.use(function () {
      this.throw(400)
    })

    return request(app.listen())
      .get('/')
      .expect(400)
      .expect({
        name: 'BadRequestError',
        status: 400,
        message: 'Invalid params'
      })
  })

  tman.it('should work with options', function () {
    var app = toa(function () {
      this.throw(404)
    }, {
      onerror: function (err) {
        return {status: err.status, message: 'some error'}
      }
    })

    return request(app.listen())
      .get('/')
      .expect(404)
      .expect({status: 404, message: 'some error'})
  })

  tman.it('should work with pipeling request', function (done) {
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

tman.suite('app.use(fn)', function () {
  tman.it('should throw error with non-function middleware', function (done) {
    var app = toa()
    assert.throws(function () {
      app.use({})
    })
    done()
  })

  tman.it('should run middleware befor body', function () {
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

  tman.it('should support more middleware function styles', function () {
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

tman.suite('app.onerror(err)', function () {
  tman.it('should do nothing if status is 404', function () {
    var app = toa()
    var err = new Error()

    err.status = 404

    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.deepEqual(output, [])
  })

  tman.it('should log the error to stderr', function () {
    var app = toa()

    var err = new Error()
    err.stack = 'Foo'

    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.deepEqual(output, ['  Foo\n'])
  })

  tman.it('should transform non-error to error object', function () {
    var app = toa()

    var err = 'Foo'
    var output = stderr.inspectSync(function () {
      app.onerror(err)
    })

    assert.strictEqual(output[0].indexOf('  Error: non-error thrown: \'Foo\'\n'), 0)
  })
})

tman.suite('app.respond', function () {
  tman.suite('when this.respond === false', function () {
    tman.it('should bypass app.respond', function () {
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

  tman.suite('when HEAD is used', function () {
    tman.it('should not respond with the body', function () {
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

    tman.it('should keep json headers', function () {
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

    tman.it('should keep string headers', function () {
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

    tman.it('should keep buffer headers', function () {
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

    tman.it('should respond with a 404 if no body was set', function () {
      var app = toa(function () {})

      return request(app.listen())
        .head('/')
        .expect(404)
    })

    tman.it('should respond with a 200 if body = ""', function () {
      var app = toa(function () {
        this.body = ''
      })

      return request(app.listen())
        .head('/')
        .expect(200)
    })

    tman.it('should not overwrite the content-type', function () {
      var app = toa(function () {
        this.status = 200
        this.type = 'application/javascript'
      })

      return request(app.listen())
        .head('/')
        .expect('content-type', /application\/javascript/)
        .expect(200)
    })

    tman.it('should not send Content-Type header', function (done) {
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

  tman.suite('when no middleware and no body are present', function () {
    tman.it('should 404', function () {
      var app = toa()

      return request(app.listen())
        .get('/')
        .expect(404)
    })
  })

  tman.suite('when res has already been written to', function () {
    tman.it('should not cause an app error', function (done) {
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

    tman.it('should send the right body', function () {
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

  tman.suite('when .body is missing', function () {
    tman.suite('with status=400', function () {
      tman.it('should respond with the associated status message', function () {
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

    tman.suite('with status=204', function () {
      tman.it('should respond without a body', function () {
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

    tman.suite('with status=205', function () {
      tman.it('should respond without a body', function () {
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

    tman.suite('with status=304', function () {
      tman.it('should respond without a body', function () {
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

    tman.suite('with custom status=700', function () {
      tman.it('should respond with the associated status message', function () {
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

    tman.suite('with custom statusMessage=ok', function () {
      tman.it('should respond with the custom status message', function () {
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

    tman.suite('with custom status without message', function () {
      tman.it('should respond with the status code number', function () {
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

  tman.suite('when .body is a null', function () {
    tman.it('should respond 204 by default', function () {
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

    tman.it('should respond 204 with status=200', function () {
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

    tman.it('should respond 205 with status=205', function () {
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

    tman.it('should respond 304 with status=304', function () {
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

  tman.suite('when .body is a string', function () {
    tman.it('should respond', function () {
      var app = toa(function () {
        this.body = 'Hello'
      })

      return request(app.listen())
        .get('/')
        .expect('Hello')
    })
  })

  tman.suite('when .body is a Buffer', function () {
    tman.it('should respond', function () {
      var app = toa(function () {
        this.body = new Buffer('Hello')
      })

      return request(app.listen())
        .get('/')
        .expect('Hello')
    })
  })

  tman.suite('when .body is a Stream', function () {
    tman.it('should respond', function () {
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

    tman.it('should strip content-length when overwriting', function () {
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

    tman.it('should keep content-length if not overwritten', function () {
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

    tman.it('should keep content-length if overwritten with the same stream', function () {
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

    tman.it('should handle errors', function () {
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

    tman.it('should handle errors when no content status', function () {
      var app = toa(function () {
        this.status = 204
        this.body = fs.createReadStream('does not exist1')
      })

      return request(app.listen())
        .get('/')
        .expect(204)
    })

    tman.it('should handle all intermediate stream body errors', function () {
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

    tman.it('should destroy stream after respond', function (done) {
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

    tman.it('should destroy stream when response has a error', function (done) {
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

    tman.it('should destroy previous stream body', function () {
      var destroyed = false
      var stream = fs.createReadStream('package.json')
      var destroy = stream.destroy
      stream.destroy = function () {
        destroyed = true
        destroy.call(stream)
      }
      var app = toa(function () {
        this.body = stream
        this.body = fs.createReadStream('does not exist5')
        assert.ok(this.getStreamCleanHandle(stream))
      })

      return request(app.listen())
        .get('/')
        .expect(404)
        .expect(function (res) {
          assert.strictEqual(destroyed, true)
        })
    })
  })

  tman.suite('when .body is an Object', function () {
    tman.it('should respond with json', function () {
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

  tman.suite('when an error occurs', function () {
    tman.it('should emit "error" on the app', function (done) {
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

    tman.suite('with an .expose property', function () {
      tman.it('should expose the message', function () {
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

    tman.suite('with a .status property', function () {
      tman.it('should respond with .status', function () {
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

    tman.it('should respond with 500', function () {
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

    tman.it('should be catchable', function () {
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

    tman.it('should retain "Accept" headers', function () {
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

    tman.it('should retain "Allow" headers', function () {
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

    tman.it('should retain "Retry-After" headers', function () {
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

    tman.it('should retain "Warning" headers', function () {
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

    tman.it('should retain CORS headers', function () {
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

  tman.suite('when status and body property', function () {
    tman.it('should 200', function () {
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

    tman.it('should 204', function () {
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

tman.suite('app.context', function () {
  var app1 = toa()
  app1.context.msg = 'hello'
  var app2 = toa()

  tman.it('should merge properties', function () {
    app1.use(function (next) {
      assert.strictEqual(this.msg, 'hello')
      this.status = 204
      return next()
    })

    return request(app1.listen())
      .get('/')
      .expect(204)
  })

  tman.it('should not affect the original prototype', function () {
    app2.use(function (next) {
      assert.strictEqual(this.msg, undefined)
      this.status = 204
      return next()
    })

    return request(app2.listen())
      .get('/')
      .expect(204)
  })

  tman.it('should throw error with non-object config', function () {
    var app = toa()

    assert.throws(function () {
      app.config = null
    })
    assert.strictEqual(app.config.poweredBy, 'Toa')
  })

  tman.it('should not affect the application config', function () {
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

tman.suite('app.request', function () {
  var app1 = toa()
  app1.request.message = 'hello'
  var app2 = toa()

  tman.it('should merge properties', function () {
    app1.use(function (next) {
      assert.strictEqual(this.request.message, 'hello')
      this.status = 204
      return next()
    })

    return request(app1.listen())
      .get('/')
      .expect(204)
  })

  tman.it('should not affect the original prototype', function () {
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

tman.suite('app.response', function () {
  var app1 = toa()
  app1.response.msg = 'hello'
  var app2 = toa()

  tman.it('should merge properties', function () {
    app1.use(function (next) {
      assert.strictEqual(this.response.msg, 'hello')
      this.status = 204
      return next()
    })

    return request(app1.listen())
      .get('/')
      .expect(204)
  })

  tman.it('should not affect the original prototype', function () {
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
