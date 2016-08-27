'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.remove(name)', function () {
  tman.it('should remove a field', function () {
    var ctx = context()
    ctx.set('x-foo', 'bar')
    ctx.remove('x-foo')
    assert.deepEqual(ctx.response.header, {})
  })
})
