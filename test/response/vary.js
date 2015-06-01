'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.vary(field)', function () {
  describe('when Vary is not set', function () {
    it('should set it', function () {
      var ctx = context()
      ctx.vary('Accept')
      assert(ctx.response.header.vary === 'Accept')
    })
  })

  describe('when Vary is set', function () {
    it('should append', function () {
      var ctx = context()
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      assert(ctx.response.header.vary === 'Accept, Accept-Encoding')
    })
  })

  describe('when Vary already contains the value', function () {
    it('should not append', function () {
      var ctx = context()
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      assert(ctx.response.header.vary === 'Accept, Accept-Encoding')
    })
  })
})
