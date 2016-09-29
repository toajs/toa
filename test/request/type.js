'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.type', function () {
  tman.it('should return type void of parameters', function () {
    let req = request()
    req.header['content-type'] = 'text/html; charset=utf-8'
    assert.strictEqual(req.type, 'text/html')
  })

  tman.it('with no host present', function () {
    let req = request()
    assert.strictEqual(req.type, '')
  })
})
