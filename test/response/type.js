'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.type=', function () {
  describe('with a mime', function () {
    it('should set the Content-Type', function () {
      var ctx = context()
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  describe('with an extension', function () {
    it('should lookup the mime', function () {
      var ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })
  })

  describe('without a charset', function () {
    it('should default the charset', function () {
      var ctx = context()
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })
  })

  describe('with a charset', function () {
    it('should not default the charset', function () {
      var ctx = context()
      ctx.type = 'text/html; charset=foo'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=foo')
    })
  })

  describe('with an unknown extension', function () {
    it('should default to application/octet-stream', function () {
      var ctx = context()
      ctx.type = 'asdf'
      assert.strictEqual(ctx.type, 'application/octet-stream')
      assert.strictEqual(ctx.response.header['content-type'], 'application/octet-stream')
    })
  })
})

describe('ctx.type', function () {
  describe('with no Content-Type', function () {
    it('should return ""', function () {
      var ctx = context()
      // TODO: this is lame
      assert.strictEqual(ctx.type, '')
    })
  })

  describe('with a Content-Type', function () {
    it('should return the mime', function () {
      var ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
    })
  })
})
