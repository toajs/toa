'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var request = require('../context').request

describe('req.ips', function () {
  describe('when X-Forwarded-For is present', function () {
    describe('and proxy is not trusted', function () {
      it('should be ignored', function () {
        var req = request()
        req.ctx.config.proxy = false
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2'
        assert.deepEqual(req.ips, [])
      })
    })

    describe('and proxy is trusted', function () {
      it('should be used', function () {
        var req = request()
        req.ctx.config.proxy = true
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2'
        assert.deepEqual(req.ips, ['127.0.0.1', '127.0.0.2'])
      })
    })
  })
})
