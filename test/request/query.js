'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.query', function () {
  suite('when missing', function () {
    it('should return an empty object', function () {
      var ctx = context({
        url: '/'
      })
      assert.deepEqual(ctx.query, {})
    })
  })

  it("should return the same object each time it's accessed", function () {
    var ctx = context({url: '/'})
    ctx.query.a = '2'
    assert.strictEqual(ctx.query.a, '2')
  })

  it('should return a parsed query-string', function () {
    var ctx = context({
      url: '/?page=2'
    })
    assert.strictEqual(ctx.query.page, '2')
  })
})

suite('ctx.query=', function () {
  it('should stringify and replace the querystring and search', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.query = {
      page: 2,
      color: 'blue'
    }
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.querystring, 'page=2&color=blue')
    assert.strictEqual(ctx.search, '?page=2&color=blue')
  })

  it('should change .url but not .originalUrl', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.query = {
      page: 2
    }
    assert.strictEqual(ctx.url, '/store/shoes?page=2')
    assert.strictEqual(ctx.originalUrl, '/store/shoes')
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes')
  })
})
