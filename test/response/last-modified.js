'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response

tman.suite('res.lastModified', function () {
  tman.it('should set the header as a UTCString', function () {
    let res = response()
    let date = new Date()
    res.lastModified = date
    assert.strictEqual(res.header['last-modified'], date.toUTCString())
  })

  tman.it('should work with date strings', function () {
    let res = response()
    let date = new Date()
    res.lastModified = date.toString()
    assert.strictEqual(res.header['last-modified'], date.toUTCString())
  })

  tman.it('should get the header as a Date', function () {
    // Note: Date() removes milliseconds, but it's practically important.
    let res = response()
    let date = new Date()
    res.lastModified = date
    assert.strictEqual((res.lastModified.getTime() / 1000), Math.floor(date.getTime() / 1000))
  })

  tman.suite('when lastModified not set', function () {
    tman.it('should get undefined', function () {
      let res = response()
      assert.strictEqual(res.lastModified == null, true)
    })
  })
})
