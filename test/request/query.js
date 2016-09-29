'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.query', function () {
  tman.suite('when missing', function () {
    tman.it('should return an empty object', function () {
      let ctx = context({
        url: '/'
      })
      assert.deepEqual(ctx.query, {})
    })
  })

  tman.it('should return the same object each time it\'s accessed', function () {
    let ctx = context({url: '/'})
    ctx.query.a = '2'
    assert.strictEqual(ctx.query.a, '2')
  })

  tman.it('should return a parsed query-string', function () {
    let ctx = context({
      url: '/?page=2'
    })
    assert.strictEqual(ctx.query.page, '2')
  })
})

tman.suite('ctx.query=', function () {
  tman.it('should stringify and replace the querystring and search', function () {
    let ctx = context({
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

  tman.it('should change .url but not .originalUrl', function () {
    let ctx = context({
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
