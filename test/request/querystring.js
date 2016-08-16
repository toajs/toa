'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')
var parseurl = require('parseurl')

suite('ctx.querystring=', function () {
  it('should replace the querystring', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.querystring, 'page=2&color=blue')
  })

  it('should update ctx.search and ctx.query', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.search, '?page=2&color=blue')
    assert.deepEqual(ctx.query, {
      page: '2',
      color: 'blue'
    })
  })

  it('should change .url but not .originalUrl', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.originalUrl, '/store/shoes')
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes')
  })

  it('should not affect parseurl', function () {
    var ctx = context({url: '/login?foo=bar'})
    ctx.querystring = 'foo=bar'
    var url = parseurl(ctx.req)
    assert.strictEqual(url.path, '/login?foo=bar')
  })
})
