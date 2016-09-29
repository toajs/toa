'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.set(name, val)', function () {
  tman.it('should set a field value', function () {
    let ctx = context()
    ctx.set('x-foo', 'bar')
    assert.strictEqual(ctx.response.header['x-foo'], 'bar')
  })

  tman.it('should coerce to a string', function () {
    let ctx = context()
    ctx.set('x-foo', 5)
    assert.strictEqual(ctx.response.header['x-foo'], '5')
  })

  tman.it('should set a field value of array', function () {
    let ctx = context()
    ctx.set('x-foo', ['foo', 'bar'])
    assert.deepEqual(ctx.response.header['x-foo'], ['foo', 'bar'])
  })
})

tman.suite('ctx.set(object)', function () {
  tman.it('should set multiple fields', function () {
    let ctx = context()

    ctx.set({
      foo: '1',
      bar: '2'
    })

    assert.strictEqual(ctx.response.header.foo, '1')
    assert.strictEqual(ctx.response.header.bar, '2')
  })
})
