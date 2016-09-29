'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.headers', function () {
  tman.it('should return the request header object', function () {
    let req = request()
    assert.strictEqual(req.headers, req.req.headers)
  })
})
