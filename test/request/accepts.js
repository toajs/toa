'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.accepts(types)', function () {
  tman.suite('with no arguments', function () {
    tman.suite('when Accept is populated', function () {
      tman.it('should return all accepted types', function () {
        var ctx = context()
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain'
        assert.deepEqual(ctx.accepts(), ['text/html', 'text/plain', 'image/jpeg', 'application/*'])
      })
    })
  })

  tman.suite('with no valid types', function () {
    tman.suite('when Accept is populated', function () {
      tman.it('should return false', function () {
        var ctx = context()
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain'
        assert.strictEqual(ctx.accepts('image/png', 'image/tiff'), false)
      })
    })

    tman.suite('when Accept is not populated', function () {
      tman.it('should return the first type', function () {
        var ctx = context()
        assert.strictEqual(ctx.accepts('text/html', 'text/plain', 'image/jpeg', 'application/*'), 'text/html')
      })
    })
  })

  tman.suite('when extensions are given', function () {
    tman.it('should convert to mime types', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('html'), 'html')
      assert.strictEqual(ctx.accepts('.html'), '.html')
      assert.strictEqual(ctx.accepts('txt'), 'txt')
      assert.strictEqual(ctx.accepts('.txt'), '.txt')
      assert.strictEqual(ctx.accepts('png'), false)
    })
  })

  tman.suite('when an array is given', function () {
    tman.it('should return the first match', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts(['png', 'text', 'html']), 'text')
      assert.strictEqual(ctx.accepts(['png', 'html']), 'html')
    })
  })

  tman.suite('when multiple arguments are given', function () {
    tman.it('should return the first match', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('png', 'text', 'html'), 'text')
      assert.strictEqual(ctx.accepts('png', 'html'), 'html')
    })
  })

  tman.suite('when present in Accept as an exact match', function () {
    tman.it('should return the type', function () {
      var ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
    })
  })

  tman.suite('when present in Accept as a type match', function () {
    tman.it('should return the type', function () {
      var ctx = context()
      ctx.req.headers.accept = 'application/json, */*'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
      assert.strictEqual(ctx.accepts('image/png'), 'image/png')
    })
  })

  tman.suite('when present in Accept as a subtype match', function () {
    tman.it('should return the type', function () {
      var ctx = context()
      ctx.req.headers.accept = 'application/json, text/*'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
      assert.strictEqual(ctx.accepts('image/png'), false)
    })
  })
})
