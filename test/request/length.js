'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('ctx.length', function () {
  tman.it('should return length in content-length', function () {
    const req = request()
    req.header['content-length'] = '10'
    assert.strictEqual(req.length, 10)
  })

  tman.it('with no content-length present', function () {
    const req = request()
    assert.strictEqual(req.length == null, true)
  })
})
