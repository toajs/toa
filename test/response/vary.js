'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.vary(field)', function () {
  suite('when Vary is not set', function () {
    it('should set it', function () {
      var ctx = context()
      ctx.vary('Accept')
      assert.strictEqual(ctx.response.header.vary, 'Accept')
    })
  })

  suite('when Vary is set', function () {
    it('should append', function () {
      var ctx = context()
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      assert.strictEqual(ctx.response.header.vary, 'Accept, Accept-Encoding')
    })
  })

  suite('when Vary already contains the value', function () {
    it('should not append', function () {
      var ctx = context()
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      assert.strictEqual(ctx.response.header.vary, 'Accept, Accept-Encoding')
    })
  })
})
