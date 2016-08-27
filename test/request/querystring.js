'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')
var parseurl = require('parseurl')

tman.suite('ctx.querystring=', function () {
  tman.it('should replace the querystring', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.querystring, 'page=2&color=blue')
  })

  tman.it('should update ctx.search and ctx.query', function () {
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

  tman.it('should change .url but not .originalUrl', function () {
    var ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.originalUrl, '/store/shoes')
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes')
  })

  tman.it('should not affect parseurl', function () {
    var ctx = context({url: '/login?foo=bar'})
    ctx.querystring = 'foo=bar'
    var url = parseurl(ctx.req)
    assert.strictEqual(url.path, '/login?foo=bar')
  })
})
