'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var request = require('../context').request

suite('req.host', function () {
  it('should return host with port', function () {
    var req = request()
    req.header.host = 'foo.com:3000'
    assert.strictEqual(req.host, 'foo.com:3000')
  })

  suite('with no host present', function () {
    it('should return null', function () {
      var req = request()
      assert.strictEqual(req.host, '')
    })
  })

  suite('when X-Forwarded-Host is present', function () {
    suite('and proxy is not trusted', function () {
      it('should be ignored', function () {
        var req = request()
        req.header['x-forwarded-host'] = 'bar.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.host, 'foo.com')
      })
    })

    suite('and proxy is trusted', function () {
      it('should be used', function () {
        var req = request()
        req.ctx.config.proxy = true
        req.header['x-forwarded-host'] = 'bar.com, baz.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.host, 'bar.com')
      })
    })
  })
})
