'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.charset', function () {
  tman.suite('with no content-type present', function () {
    tman.it('should return ""', function () {
      let req = request()
      assert.strictEqual(req.charset, '')
    })
  })

  tman.suite('with charset present', function () {
    tman.it('should return ""', function () {
      let req = request()
      req.header['content-type'] = 'text/plain'
      assert.strictEqual(req.charset, '')
    })
  })

  tman.suite('with a charset', function () {
    tman.it('should return the charset', function () {
      let req = request()
      req.header['content-type'] = 'text/plain; charset=utf-8'
      assert.strictEqual(req.charset, 'utf-8')
    })
  })

  tman.it('should return "" if content-type is invalid', function () {
    let req = request()
    req.header['content-type'] = 'application/json; application/text; charset=utf-8'
    assert.strictEqual(req.charset, '')
  })
})
