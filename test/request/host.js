'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.host', function () {
  tman.it('should return host with port', function () {
    let req = request()
    req.header.host = 'foo.com:3000'
    assert.strictEqual(req.host, 'foo.com:3000')
  })

  tman.suite('with no host present', function () {
    tman.it('should return null', function () {
      let req = request()
      assert.strictEqual(req.host, '')
    })
  })

  tman.suite('when X-Forwarded-Host is present', function () {
    tman.suite('and proxy is not trusted', function () {
      tman.it('should be ignored', function () {
        let req = request()
        req.header['x-forwarded-host'] = 'bar.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.host, 'foo.com')
      })
    })

    tman.suite('and proxy is trusted', function () {
      tman.it('should be used', function () {
        let req = request()
        req.ctx.config.proxy = true
        req.header['x-forwarded-host'] = 'bar.com, baz.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.host, 'bar.com')
      })
    })
  })
})
