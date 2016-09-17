'use strict'

var tman = require('tman')
var assert = require('assert')
var thunks = require('thunks')
var request = require('supertest')
var toa = require('../..')

tman.suite('context end', function () {
  tman.it('should respond body with context.end', function () {
    var app = toa(function () {
      this.body = 'Good job.'
      return this.thunk()(function () {
        this.end('test this.end')
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
  })

  tman.it('should not overwrite response body with context.end', function () {
    var app = toa(function () {
      return this.thunk()(function () {
        this.body = 'Good job.'
        this.end('test this.end')
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
  })

  tman.it('should not run next middleware with context.end', function () {
    var app = toa()

    app.use(function () {
      this.body = 'Good job.'
      this.end()
    })

    app.use(function () {
      assert.strictEqual('It should not run', true)
    })

    return request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
  })

  tman.it('should work in nested thunks', function () {
    var thunk = thunks()
    var app = toa(function () {
      return this.thunk()(function () {
        return thunk.call(this)(function () {
          this.end('nested thunks')
        })
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(418)
      .expect(function (res) {
        assert.strictEqual(res.res.statusMessage || res.res.text, 'nested thunks')
      })
  })

  tman.it('after hooks should run only once when ctx.end()', function () {
    var called = 0

    var app = toa(function () {
      this.after(function () {
        called++
        assert.strictEqual(this.after(function () {}), 0)
        this.end('end in after hooks')
      })
      this.end('end in body')
    })

    return request(app.listen())
      .get('/')
      .expect(418)
      .expect('end in body')
      .expect(function (res) {
        assert.strictEqual(called, 1)
      })
  })
})
