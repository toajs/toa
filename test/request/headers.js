'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('req.headers', function () {
  tman.it('should return the request header object', function () {
    var req = request()
    assert.strictEqual(req.headers, req.req.headers)
  })
})
