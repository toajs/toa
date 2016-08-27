'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('req.protocol', function () {
  tman.suite('when encrypted', function () {
    tman.it('should return "https"', function () {
      var req = request()
      req.req.socket = {
        encrypted: true
      }
      assert.strictEqual(req.protocol, 'https')
    })
  })

  tman.suite('when unencrypted', function () {
    tman.it('should return "http"', function () {
      var req = request()
      req.req.socket = {}
      assert.strictEqual(req.protocol, 'http')
    })
  })

  tman.suite('when X-Forwarded-Proto is set', function () {
    tman.suite('and proxy is trusted', function () {
      tman.it('should be used', function () {
        var req = request()
        req.ctx.config.proxy = true
        req.req.socket = {}
        req.header['x-forwarded-proto'] = 'https, http'
        assert.strictEqual(req.protocol, 'https')
      })

      tman.suite('and X-Forwarded-Proto is empty', function () {
        tman.it('should return "http"', function () {
          var req = request()
          req.ctx.config.proxy = true
          req.req.socket = {}
          req.header['x-forwarded-proto'] = ''
          assert.strictEqual(req.protocol, 'http')
        })
      })
    })

    tman.suite('and proxy is not trusted', function () {
      tman.it('should not be used', function () {
        var req = request()
        req.req.socket = {}
        req.header['x-forwarded-proto'] = 'https, http'
        assert.strictEqual(req.protocol, 'http')
      })
    })
  })
})
