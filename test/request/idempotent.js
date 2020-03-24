'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('ctx.idempotent', function () {
  tman.suite('when the request method is idempotent', function () {
    tman.it('should return true', function () {
      ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].forEach(check)
      function check (method) {
        const req = request()
        req.method = method
        assert.strictEqual(req.idempotent, true)
      }
    })
  })

  tman.suite('when the request method is not idempotent', function () {
    tman.it('should return false', function () {
      const req = request()
      req.method = 'POST'
      assert.strictEqual(req.idempotent, false)
    })
  })
})
