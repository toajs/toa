'use strict'

var tman = require('tman')
var assert = require('assert')
var response = require('../context').response

tman.suite('res.header', function () {
  tman.it('should return the response header object', function () {
    var res = response()
    res.set('X-Foo', 'bar')
    assert.deepEqual(res.headers, {'x-foo': 'bar'})
  })

  tman.suite('when res._headers not present', function () {
    tman.it('should return empty object', function () {
      var res = response()
      res.res._headers = null
      assert.deepEqual(res.headers, {})
    })
  })
})
