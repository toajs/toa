'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.fresh', function () {
  suite('the request method is not GET and HEAD', function () {
    it('should return false', function () {
      var ctx = context()
      ctx.req.method = 'POST'
      assert.strictEqual(ctx.fresh, false)
    })
  })

  suite('the response is non-2xx', function () {
    it('should return false', function () {
      var ctx = context()
      ctx.status = 404
      ctx.req.method = 'GET'
      ctx.req.headers['if-none-match'] = '123'
      ctx.set('ETag', '123')
      assert.strictEqual(ctx.fresh, false)
    })
  })

  suite('the response is 2xx', function () {
    suite('and etag matches', function () {
      it('should return true', function () {
        var ctx = context()
        ctx.status = 200
        ctx.req.method = 'GET'
        ctx.req.headers['if-none-match'] = '123'
        ctx.set('ETag', '123')
        assert.strictEqual(ctx.fresh, true)
      })
    })

    suite('and etag do not match', function () {
      it('should return false', function () {
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
