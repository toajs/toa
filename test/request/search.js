'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.search=', function () {
  it('should replace the search', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.search = '?page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.search, '?page=2&color=blue')
  })

  it('should update ctx.querystring and ctx.query', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.search = '?page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.querystring, 'page=2&color=blue')
    assert.deepEqual(ctx.query, {
      page: '2',
      color: 'blue'
    })
  })

  it('should change .url but not .originalUrl', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.search = '?page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.originalUrl, '/store/shoes')
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes')
  })

  describe('when missing', function () {
    it('should return ""', function () {
      var ctx = context({
        url: '/store/shoes'
      })
      assert.strictEqual(ctx.search, '')
    })
  })
})
