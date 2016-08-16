'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var context = require('../context')
var assert = require('assert')

suite('ctx.is(type)', function () {
  it('should ignore params', function () {
    var ctx = context()
    ctx.header['content-type'] = 'text/html; charset=utf-8'
    ctx.header['transfer-encoding'] = 'chunked'

    assert.strictEqual(ctx.is('text/*'), 'text/html')
  })

  suite('when no body is given', function () {
    it('should return null', function () {
      var ctx = context()

      assert.strictEqual(ctx.is() == null, true)
      assert.strictEqual(ctx.is('image/*') == null, true)
      assert.strictEqual(ctx.is('image/*', 'text/*') == null, true)
    })
  })

  suite('when no content type is given', function () {
    it('should return false', function () {
      var ctx = context()
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is(), false)
      assert.strictEqual(ctx.is('image/*'), false)
      assert.strictEqual(ctx.is('text/*', 'image/*'), false)
    })
  })

  suite('give no types', function () {
    it('should return the mime type', function () {
      var ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is(), 'image/png')
    })
  })

  suite('given one type', function () {
    it('should return the type or false', function () {
      var ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('png'), 'png')
      assert.strictEqual(ctx.is('.png'), '.png')
      assert.strictEqual(ctx.is('image/png'), 'image/png')
      assert.strictEqual(ctx.is('image/*'), 'image/png')
      assert.strictEqual(ctx.is('*/png'), 'image/png')

      assert.strictEqual(ctx.is('jpeg'), false)
      assert.strictEqual(ctx.is('.jpeg'), false)
      assert.strictEqual(ctx.is('image/jpeg'), false)
      assert.strictEqual(ctx.is('text/*'), false)
      assert.strictEqual(ctx.is('*/jpeg'), false)
    })
  })

  suite('given multiple types', function () {
    it('should return the first match or false', function () {
      var ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('png'), 'png')
      assert.strictEqual(ctx.is('.png'), '.png')
      assert.strictEqual(ctx.is('text/*', 'image/*'), 'image/png')
      assert.strictEqual(ctx.is('image/*', 'text/*'), 'image/png')
      assert.strictEqual(ctx.is('image/*', 'image/png'), 'image/png')
      assert.strictEqual(ctx.is('image/png', 'image/*'), 'image/png')

      assert.strictEqual(ctx.is(['text/*', 'image/*']), 'image/png')
      assert.strictEqual(ctx.is(['image/*', 'text/*']), 'image/png')
      assert.strictEqual(ctx.is(['image/*', 'image/png']), 'image/png')
      assert.strictEqual(ctx.is(['image/png', 'image/*']), 'image/png')

      assert.strictEqual(ctx.is('jpeg'), false)
      assert.strictEqual(ctx.is('.jpeg'), false)
      assert.strictEqual(ctx.is('text/*', 'application/*'), false)
      assert.strictEqual(ctx.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false)
    })
  })

  suite('when Content-Type: application/x-www-form-urlencoded', function () {
    it('should match "urlencoded"', function () {
      var ctx = context()
      ctx.header['content-type'] = 'application/x-www-form-urlencoded'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('urlencoded'), 'urlencoded')
      assert.strictEqual(ctx.is('json', 'urlencoded'), 'urlencoded')
      assert.strictEqual(ctx.is('urlencoded', 'json'), 'urlencoded')
    })
  })
})
