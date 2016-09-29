'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.get(name)', function () {
  tman.it('should return the field value', function () {
    let ctx = context()
    ctx.req.headers.host = 'http://google.com'
    ctx.req.headers.referer = 'http://google.com'
    assert.strictEqual(ctx.get('HOST'), 'http://google.com')
    assert.strictEqual(ctx.get('Host'), 'http://google.com')
    assert.strictEqual(ctx.get('host'), 'http://google.com')
    assert.strictEqual(ctx.get('referer'), 'http://google.com')
    assert.strictEqual(ctx.get('referrer'), 'http://google.com')
  })
})
