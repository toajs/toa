'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('req.ips', function () {
  tman.suite('when X-Forwarded-For is present', function () {
    tman.suite('and proxy is not trusted', function () {
      tman.it('should be ignored', function () {
        var req = request()
        req.ctx.config.proxy = false
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2'
        assert.deepEqual(req.ips, [])
      })
    })

    tman.suite('and proxy is trusted', function () {
      tman.it('should be used', function () {
        var req = request()
        req.ctx.config.proxy = true
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2'
        assert.deepEqual(req.ips, ['127.0.0.1', '127.0.0.2'])
      })
    })
  })
})
