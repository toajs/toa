'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('response.is(type)', function () {
  it('should ignore params', function () {
    var res = context().response
    res.type = 'text/html; charset=utf-8'

    assert.strictEqual(res.is('text/*'), 'text/html')
  })

  suite('when no type is set', function () {
    it('should return false', function () {
      var res = context().response

      assert.strictEqual(res.is(), false)
      assert.strictEqual(res.is('html'), false)
    })
  })

  suite('when given no types', function () {
    it('should return the type', function () {
      var res = context().response
      res.type = 'text/html; charset=utf-8'

      assert.strictEqual(res.is(), 'text/html')
    })
  })

  suite('given one type', function () {
    it('should return the type or false', function () {
      var res = context().response
      res.type = 'image/png'

      assert.strictEqual(res.is('png'), 'png')
      assert.strictEqual(res.is('.png'), '.png')
      assert.strictEqual(res.is('image/png'), 'image/png')
      assert.strictEqual(res.is('image/*'), 'image/png')
      assert.strictEqual(res.is('*/png'), 'image/png')

      assert.strictEqual(res.is('jpeg'), false)
      assert.strictEqual(res.is('.jpeg'), false)
      assert.strictEqual(res.is('image/jpeg'), false)
      assert.strictEqual(res.is('text/*'), false)
      assert.strictEqual(res.is('*/jpeg'), false)
    })
  })

  suite('given multiple types', function () {
    it('should return the first match or false', function () {
      var res = context().response
      res.type = 'image/png'

      assert.strictEqual(res.is('png'), 'png')
      assert.strictEqual(res.is('.png'), '.png')
      assert.strictEqual(res.is('text/*', 'image/*'), 'image/png')
      assert.strictEqual(res.is('image/*', 'text/*'), 'image/png')
      assert.strictEqual(res.is('image/*', 'image/png'), 'image/png')
      assert.strictEqual(res.is('image/png', 'image/*'), 'image/png')

      assert.strictEqual(res.is(['text/*', 'image/*']), 'image/png')
      assert.strictEqual(res.is(['image/*', 'text/*']), 'image/png')
      assert.strictEqual(res.is(['image/*', 'image/png']), 'image/png')
      assert.strictEqual(res.is(['image/png', 'image/*']), 'image/png')

      assert.strictEqual(res.is('jpeg'), false)
      assert.strictEqual(res.is('.jpeg'), false)
      assert.strictEqual(res.is('text/*', 'application/*'), false)
      assert.strictEqual(res.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false)
    })
  })

  suite('when Content-Type: application/x-www-form-urlencoded', function () {
    it('should match "urlencoded"', function () {
      var res = context().response
      res.type = 'application/x-www-form-urlencoded'

      assert.strictEqual(res.is('urlencoded'), 'urlencoded')
      assert.strictEqual(res.is('json', 'urlencoded'), 'urlencoded')
      assert.strictEqual(res.is('urlencoded', 'json'), 'urlencoded')
    })
  })
})
