'use strict'

var tman = require('tman')
var assert = require('assert')
var response = require('../context').response

tman.suite('res.etag=', function () {
  tman.it('should not modify an etag with quotes', function () {
    var res = response()
    res.etag = '"asdf"'
    assert.strictEqual(res.header.etag, '"asdf"')
  })

  tman.it('should not modify a weak etag', function () {
    var res = response()
    res.etag = 'W/"asdf"'
    assert.strictEqual(res.header.etag, 'W/"asdf"')
  })

  tman.it('should add quotes around an etag if necessary', function () {
    var res = response()
    res.etag = 'asdf'
    assert.strictEqual(res.header.etag, '"asdf"')
  })
})

tman.suite('res.etag', function () {
  tman.it('should return etag', function () {
    var res = response()
    res.etag = '"asdf"'
    assert.strictEqual(res.etag, '"asdf"')
  })
})
