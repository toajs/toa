'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response

tman.suite('res.message', function () {
  tman.it('should return the response status message', function () {
    let res = response()
    res.status = 200
    assert.strictEqual(res.message, 'OK')
  })

  tman.suite('when res.message not present', function () {
    tman.it('should look up in statuses', function () {
      let res = response()
      res.res.statusCode = 200
      assert.strictEqual(res.message, 'OK')
    })
  })
})

tman.suite('res.message=', function () {
  tman.it('should set response status message', function () {
    let res = response()
    res.status = 200
    res.message = 'ok'
    assert.strictEqual(res.res.statusMessage || res.res.text, 'ok')
    assert.strictEqual(res.inspect().message, 'ok')
  })
})
