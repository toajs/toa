'use strict'

var tman = require('tman')
var assert = require('assert')
var response = require('../context').response

tman.suite('res.inspect()', function () {
  tman.suite('with no response.res present', function () {
    tman.it('should return null', function () {
      var res = response()
      res.body = 'hello'
      delete res.res
      assert.strictEqual(res.inspect() === null, true)
    })
  })

  tman.it('should return a json representation', function () {
    var res = response()
    res.body = 'hello'

    assert.deepEqual(res.inspect(), {
      body: 'hello',
      status: 200,
      message: 'OK',
      header: {
        'content-length': '5',
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  })
})
