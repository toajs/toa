'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.origin', function () {
  tman.it('should return the origin of url', function () {
    const req = {
      url: '/users/1?next=/dashboard',
      headers: {
        host: 'localhost'
      }
    }
    const ctx = context(req)
    assert.strictEqual(ctx.origin, 'http://localhost')
    // change url
    ctx.url = '/foo/users/1?next=/dashboard'
    assert.strictEqual(ctx.origin, 'http://localhost')
  })
})
