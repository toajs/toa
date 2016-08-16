'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var response = require('../context').response

suite('res.lastModified', function () {
  it('should set the header as a UTCString', function () {
    var res = response()
    var date = new Date()
    res.lastModified = date
    assert.strictEqual(res.header['last-modified'], date.toUTCString())
  })

  it('should work with date strings', function () {
    var res = response()
    var date = new Date()
    res.lastModified = date.toString()
    assert.strictEqual(res.header['last-modified'], date.toUTCString())
  })

  it('should get the header as a Date', function () {
    // Note: Date() removes milliseconds, but it's practically important.
    var res = response()
    var date = new Date()
    res.lastModified = date
    assert.strictEqual((res.lastModified.getTime() / 1000), Math.floor(date.getTime() / 1000))
  })

  suite('when lastModified not set', function () {
    it('should get undefined', function () {
      var res = response()
      assert.strictEqual(res.lastModified == null, true)
    })
  })
})
