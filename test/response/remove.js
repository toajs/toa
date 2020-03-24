'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.remove(name)', function () {
  tman.it('should remove a field', function () {
    const ctx = context()
    ctx.set('x-foo', 'bar')
    ctx.remove('x-foo')
    assert.deepStrictEqual(ctx.response.header, {})
  })
})
