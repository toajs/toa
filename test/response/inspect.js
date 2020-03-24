'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response

tman.suite('res.inspect()', function () {
  tman.suite('with no response.res present', function () {
    tman.it('should return null', function () {
      const res = response()
      res.body = 'hello'
      delete res.res
      assert.strictEqual(res.inspect() === null, true)
    })
  })

  tman.it('should return a json representation', function () {
    const res = response()
    res.body = 'hello'

    assert.deepStrictEqual(res.inspect(), {
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
