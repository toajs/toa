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

suite('ctx.path', function () {
  it('should return the pathname', function () {
    var ctx = context()
    ctx.url = '/login?next=/dashboard'
    assert.strictEqual(ctx.path, '/login')
  })
})

suite('ctx.path=', function () {
  it('should set the pathname', function () {
    var ctx = context()
    ctx.url = '/login?next=/dashboard'

    ctx.path = '/logout'
    assert.strictEqual(ctx.path, '/logout')
    assert.strictEqual(ctx.url, '/logout?next=/dashboard')
  })

  it('should change .url but not .originalUrl', function () {
    var ctx = context({url: '/login'})
    ctx.path = '/logout'
    assert.strictEqual(ctx.url, '/logout')
    assert.strictEqual(ctx.originalUrl, '/login')
    assert.strictEqual(ctx.request.originalUrl, '/login')
  })

  it('should not affect parseurl', function () {
    var ctx = context({url: '/login?foo=bar'})
    ctx.path = '/login'
    var url = parseurl(ctx.req)
    assert.strictEqual(url.path, '/login?foo=bar')
  })
})
