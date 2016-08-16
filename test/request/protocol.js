'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var request = require('../context').request

suite('req.protocol', function () {
  suite('when encrypted', function () {
    it('should return "https"', function () {
      var req = request()
      req.req.socket = {
        encrypted: true
      }
      assert.strictEqual(req.protocol, 'https')
    })
  })

  suite('when unencrypted', function () {
    it('should return "http"', function () {
      var req = request()
      req.req.socket = {}
      assert.strictEqual(req.protocol, 'http')
    })
  })

  suite('when X-Forwarded-Proto is set', function () {
    suite('and proxy is trusted', function () {
      it('should be used', function () {
        var req = request()
        req.ctx.config.proxy = true
        req.req.socket = {}
        req.header['x-forwarded-proto'] = 'https, http'
        assert.strictEqual(req.protocol, 'https')
      })

      suite('and X-Forwarded-Proto is empty', function () {
        it('should return "http"', function () {
          var req = request()
          req.ctx.config.proxy = true
          req.req.socket = {}
          req.header['x-forwarded-proto'] = ''
          assert.strictEqual(req.protocol, 'http')
        })
      })
    })

    suite('and proxy is not trusted', function () {
      it('should not be used', function () {
        var req = request()
        req.req.socket = {}
        req.header['x-forwarded-proto'] = 'https, http'
        assert.strictEqual(req.protocol, 'http')
      })
    })
  })
})
