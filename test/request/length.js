'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('ctx.length', function () {
  tman.it('should return length in content-length', function () {
    var req = request()
    req.header['content-length'] = '10'
    assert.strictEqual(req.length, 10)
  })

  tman.it('with no content-length present', function () {
    var req = request()
    assert.strictEqual(req.length == null, true)
  })
})
