'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.accepts(types)', function () {
  suite('with no arguments', function () {
    suite('when Accept is populated', function () {
      it('should return all accepted types', function () {
        var ctx = context()
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain'
        assert.deepEqual(ctx.accepts(), ['text/html', 'text/plain', 'image/jpeg', 'application/*'])
      })
    })
  })

  suite('with no valid types', function () {
    suite('when Accept is populated', function () {
      it('should return false', function () {
        var ctx = context()
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain'
        assert.strictEqual(ctx.accepts('image/png', 'image/tiff'), false)
      })
    })

    suite('when Accept is not populated', function () {
      it('should return the first type', function () {
        var ctx = context()
        assert.strictEqual(ctx.accepts('text/html', 'text/plain', 'image/jpeg', 'application/*'), 'text/html')
      })
    })
  })

  suite('when extensions are given', function () {
    it('should convert to mime types', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('html'), 'html')
      assert.strictEqual(ctx.accepts('.html'), '.html')
      assert.strictEqual(ctx.accepts('txt'), 'txt')
      assert.strictEqual(ctx.accepts('.txt'), '.txt')
      assert.strictEqual(ctx.accepts('png'), false)
    })
  })

  suite('when an array is given', function () {
    it('should return the first match', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts(['png', 'text', 'html']), 'text')
      assert.strictEqual(ctx.accepts(['png', 'html']), 'html')
    })
  })

  suite('when multiple arguments are given', function () {
    it('should return the first match', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('png', 'text', 'html'), 'text')
      assert.strictEqual(ctx.accepts('png', 'html'), 'html')
    })
  })

  suite('when present in Accept as an exact match', function () {
    it('should return the type', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
    })
  })

  suite('when present in Accept as a type match', function () {
    it('should return the type', function () {
      var ctx = context()
      ctx.req.headers.accept = 'application/json, */*'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
      assert.strictEqual(ctx.accepts('image/png'), 'image/png')
    })
  })

  suite('when present in Accept as a subtype match', function () {
    it('should return the type', function () {
      var ctx = context()
      ctx.req.headers.accept = 'application/json, text/*'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
      assert.strictEqual(ctx.accepts('image/png'), false)
    })
  })
})
