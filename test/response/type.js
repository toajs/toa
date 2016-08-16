'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.type=', function () {
  suite('with a mime', function () {
    it('should set the Content-Type', function () {
      var ctx = context()
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  suite('with an extension', function () {
    it('should lookup the mime', function () {
      var ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })
  })

  suite('without a charset', function () {
    it('should default the charset', function () {
      var ctx = context()
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })
  })

  suite('with a charset', function () {
    it('should not default the charset', function () {
      var ctx = context()
      ctx.type = 'text/html; charset=foo'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=foo')
    })
  })

  suite('with an unknown extension', function () {
    it('should not set a content-type', function () {
      var ctx = context()
      ctx.type = 'asdf'
      assert.strictEqual(ctx.type, '')
      assert.strictEqual(ctx.response.header['content-type'], undefined)
    })
  })
})

suite('ctx.type', function () {
  suite('with no Content-Type', function () {
    it('should return ""', function () {
      var ctx = context()
      // TODO: this is lame
      assert.strictEqual(ctx.type, '')
    })
  })

  suite('with a Content-Type', function () {
    it('should return the mime', function () {
      var ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
    })
  })
})
