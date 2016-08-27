'use strict'

var tman = require('tman')
var assert = require('assert')
var response = require('../context').response
var Stream = require('stream')

tman.suite('res.socket', function () {
  tman.it('should return the request socket object', function () {
    var res = response()
    assert.strictEqual(res.socket instanceof Stream, true)
  })
})
