'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.secure', function () {
  tman.it('should return true when encrypted', function () {
    let req = request()
    req.req.socket = {
      encrypted: true
    }
    assert.strictEqual(req.secure, true)
  })
})
