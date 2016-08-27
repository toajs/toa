'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.fresh', function () {
  tman.suite('the request method is not GET and HEAD', function () {
    tman.it('should return false', function () {
      var ctx = context()
      ctx.req.method = 'POST'
      assert.strictEqual(ctx.fresh, false)
    })
  })

  tman.suite('the response is non-2xx', function () {
    tman.it('should return false', function () {
      var ctx = context()
      ctx.status = 404
      ctx.req.method = 'GET'
      ctx.req.headers['if-none-match'] = '123'
      ctx.set('ETag', '123')
      assert.strictEqual(ctx.fresh, false)
    })
  })

  tman.suite('the response is 2xx', function () {
    tman.suite('and etag matches', function () {
      tman.it('should return true', function () {
        var ctx = context()
        ctx.status = 200
        ctx.req.method = 'GET'
        ctx.req.headers['if-none-match'] = '123'
        ctx.set('ETag', '123')
        assert.strictEqual(ctx.fresh, true)
      })
    })

    tman.suite('and etag do not match', function () {
      tman.it('should return false', function () {
        var ctx = context()
        ctx.status = 200
        ctx.req.method = 'GET'
        ctx.req.headers['if-none-match'] = '123'
        ctx.set('ETag', 'hey')
        assert.strictEqual(ctx.fresh, false)
      })
    })
  })
})
