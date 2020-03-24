'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.hostname', function () {
  tman.it('should return hostname void of port', function () {
    const req = request()
    req.header.host = 'foo.com:3000'
    assert.strictEqual(req.hostname, 'foo.com')
  })

  tman.suite('with no host present', function () {
    tman.it('should return null', function () {
      const req = request()
      assert.strictEqual(req.hostname, '')
    })
  })

  tman.suite('when X-Forwarded-Host is present', function () {
    tman.suite('and proxy is not trusted', function () {
      tman.it('should be ignored', function () {
        const req = request()
        req.header['x-forwarded-host'] = 'bar.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.hostname, 'foo.com')
      })
    })

    tman.suite('and proxy is trusted', function () {
      tman.it('should be used', function () {
        const req = request()
        req.ctx.config.proxy = true
        req.header['x-forwarded-host'] = 'bar.com, baz.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.hostname, 'bar.com')
      })
    })
  })
})
