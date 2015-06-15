'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var thunks = require('thunks')
var request = require('supertest')
var toa = require('../..')

describe('context end', function () {
  it('should run onstop after context.end', function (done) {
    var app = toa(function () {
      assert.strictEqual('It should not run', true)
      this.body = 'test'
    }, {
      onstop: function (sig) {
        assert.strictEqual(sig.code, 'SIGSTOP')
        assert.strictEqual(sig.status, 19)
        assert.strictEqual(sig.message, 'process stopped')
      }
    })

    app.use(function (next) {
      this.end()
    })

    request(app.listen())
      .get('/')
      .expect(418)
      .expect(function (res) {
        assert.strictEqual(res.res.statusMessage || res.res.text, 'process stopped')
      })
      .end(done)
  })

  it('should respond body with onstop and context.end', function (done) {
    var app = toa(function () {
      return this.thunk()(function () {
        this.end('test this.end')
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    }, {
      onstop: function (sig) {
        assert.strictEqual(sig.code, 'SIGSTOP')
        assert.strictEqual(sig.status, 19)
        assert.strictEqual(sig.message, 'test this.end')

        this.status = 200
        return this.thunk()(function () {
          this.body = 'Good job.'
        })
      }
    })

    request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
      .end(done)
  })

  it('should not overwrite response body with context.end', function (done) {
    var app = toa(function () {
      return this.thunk()(function () {
        this.body = 'Good job.'
        this.end('test this.end')
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    })

    request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
      .end(done)
  })

  it('should work in nested thunks', function (done) {
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

    request(app.listen())
      .get('/')
      .expect(418)
      .expect(function (res) {
        assert.strictEqual(res.res.statusMessage || res.res.text, 'nested thunks')
      })
      .end(done)
  })

})
