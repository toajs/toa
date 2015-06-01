'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var response = require('../context').response

describe('res.header', function () {
  it('should return the response header object', function () {
    var res = response()
    res.set('X-Foo', 'bar')
    assert.deepEqual(res.headers, {'x-foo': 'bar'})
  })

  describe('when res._headers not present', function () {
    it('should return empty object', function () {
      var res = response()
      res.res._headers = null
      assert.deepEqual(res.headers, {})
    })
  })
})
