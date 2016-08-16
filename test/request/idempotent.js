'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var request = require('../context').request

suite('ctx.idempotent', function () {
  suite('when the request method is idempotent', function () {
    it('should return true', function () {
      ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].forEach(check)
      function check (method) {
        var req = request()
        req.method = method
        assert.strictEqual(req.idempotent, true)
      }
    })
  })

  suite('when the request method is not idempotent', function () {
    it('should return false', function () {
      var req = request()
      req.method = 'POST'
      assert.strictEqual(req.idempotent, false)
    })
  })
})
