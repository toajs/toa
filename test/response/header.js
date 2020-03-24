'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response

tman.suite('res.header', function () {
  tman.it('should return the response header object', function () {
    const res = response()
    res.set('X-Foo', 'bar')
    assert.deepStrictEqual(res.header, {
      'x-foo': 'bar'
    })
  })

  tman.suite('when res._headers not present', function () {
    tman.it('should return empty object', function () {
      const res = response()
      res.res._headers = null
      assert.deepStrictEqual(res.header, {})
    })
  })
})
