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
  it('should respond body with context.end', function () {
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

  it('should not overwrite response body with context.end', function () {
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

  it('should work in nested thunks', function () {
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
})
