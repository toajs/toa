'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response
const Stream = require('stream')

tman.suite('res.socket', function () {
  tman.it('should return the request socket object', function () {
    const res = response()
    assert.strictEqual(res.socket instanceof Stream, true)
  })
})
