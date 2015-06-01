'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.fresh', function () {
  describe('the request method is not GET and HEAD', function () {
    it('should return false', function () {
      var ctx = context()
      ctx.req.method = 'POST'
      assert(ctx.fresh === false)
    })
  })

  describe('the response is non-2xx', function () {
    it('should return false', function () {
      var ctx = context()
      ctx.status = 404
      ctx.req.method = 'GET'
      ctx.req.headers['if-none-match'] = '123'
      ctx.set('ETag', '123')
      assert(ctx.fresh === false)
    })
  })

  describe('the response is 2xx', function () {
    describe('and etag matches', function () {
      it('should return true', function () {
        var ctx = context()
        ctx.status = 200
        ctx.req.method = 'GET'
        ctx.req.headers['if-none-match'] = '123'
        ctx.set('ETag', '123')
        assert(ctx.fresh)
      })
    })

    describe('and etag do not match', function () {
      it('should return false', function () {
        var ctx = context()
        ctx.status = 200
        ctx.req.method = 'GET'
        ctx.req.headers['if-none-match'] = '123'
        ctx.set('ETag', 'hey')
        assert(ctx.fresh === false)
      })
    })
  })
})
