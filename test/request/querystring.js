'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')
const parseurl = require('parseurl')

tman.suite('ctx.querystring=', function () {
  tman.it('should replace the querystring', function () {
    const ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.querystring, 'page=2&color=blue')
  })

  tman.it('should update ctx.search and ctx.query', function () {
    const ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.search, '?page=2&color=blue')
    assert.deepStrictEqual(Object.assign({}, ctx.query), {
      page: '2',
      color: 'blue'
    })
  })

  tman.it('should change .url but not .originalUrl', function () {
    const ctx = context({
      url: '/store/shoes'
    })
    ctx.querystring = 'page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.originalUrl, '/store/shoes')
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes')
  })

  tman.it('should not affect parseurl', function () {
    const ctx = context({ url: '/login?foo=bar' })
    ctx.querystring = 'foo=bar'
    const url = parseurl(ctx.req)
    assert.strictEqual(url.path, '/login?foo=bar')
  })
})
