'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var request = require('../context').request

describe('req.protocol', function () {
  describe('when encrypted', function () {
    it('should return "https"', function () {
      var req = request()
      req.req.socket = {
        encrypted: true
      }
      assert(req.protocol === 'https')
    })
  })

  describe('when unencrypted', function () {
    it('should return "http"', function () {
      var req = request()
      req.req.socket = {}
      assert(req.protocol === 'http')
    })
  })

  describe('when X-Forwarded-Proto is set', function () {
    describe('and proxy is trusted', function () {
      it('should be used', function () {
        var req = request()
        req.ctx.config.proxy = true
        req.req.socket = {}
        req.header['x-forwarded-proto'] = 'https, http'
        assert(req.protocol === 'https')
      })

      describe('and X-Forwarded-Proto is empty', function () {
        it('should return "http"', function () {
          var req = request()
          req.ctx.config.proxy = true
          req.req.socket = {}
          req.header['x-forwarded-proto'] = ''
          assert(req.protocol === 'http')
        })
      })
    })

    describe('and proxy is not trusted', function () {
      it('should not be used', function () {
        var req = request()
        req.req.socket = {}
        req.header['x-forwarded-proto'] = 'https, http'
        assert(req.protocol === 'http')
      })
    })
  })
})
