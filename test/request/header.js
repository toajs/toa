'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.header', function () {
  tman.it('should return the request header object', function () {
    const req = request()
    assert.strictEqual(req.header, req.req.headers)
  })
})
