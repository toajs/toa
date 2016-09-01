'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.origin', function () {
  tman.it('should return the origin of url', function () {
    var req = {
      url: '/users/1?next=/dashboard',
      headers: {
        host: 'localhost'
      }
    }
    var ctx = context(req)
    assert.strictEqual(ctx.origin, 'http://localhost')
    // change url
    ctx.url = '/foo/users/1?next=/dashboard'
    assert.strictEqual(ctx.origin, 'http://localhost')
  })
})
