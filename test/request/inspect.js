'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('req.inspect()', function () {
  tman.suite('with no request.req present', function () {
    tman.it('should return null', function () {
      var req = request()
      req.method = 'GET'
      delete req.req
      assert.strictEqual(req.inspect() === null, true)
    })
  })

  tman.it('should return a json representation', function () {
    var req = request()
    req.method = 'GET'
    req.url = 'example.com'
    req.header.host = 'example.com'

    assert.deepEqual(req.inspect(), {
      method: 'GET',
      url: 'example.com',
      header: {
        host: 'example.com'
      }
    })
  })
})
