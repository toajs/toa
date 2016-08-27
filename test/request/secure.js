'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('req.secure', function () {
  tman.it('should return true when encrypted', function () {
    var req = request()
    req.req.socket = {
      encrypted: true
    }
    assert.strictEqual(req.secure, true)
  })
})
