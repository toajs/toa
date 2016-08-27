'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('req.type', function () {
  tman.it('should return type void of parameters', function () {
    var req = request()
    req.header['content-type'] = 'text/html; charset=utf-8'
    assert.strictEqual(req.type, 'text/html')
  })

  tman.it('with no host present', function () {
    var req = request()
    assert.strictEqual(req.type, '')
  })
})
