'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')
const parseurl = require('parseurl')

tman.suite('ctx.path', function () {
  tman.it('should return the pathname', function () {
    let ctx = context()
    ctx.url = '/login?next=/dashboard'
    assert.strictEqual(ctx.path, '/login')
  })
})

tman.suite('ctx.path=', function () {
  tman.it('should set the pathname', function () {
    let ctx = context()
    ctx.url = '/login?next=/dashboard'

    ctx.path = '/logout'
    assert.strictEqual(ctx.path, '/logout')
    assert.strictEqual(ctx.url, '/logout?next=/dashboard')
  })

  tman.it('should change .url but not .originalUrl', function () {
    let ctx = context({url: '/login'})
    ctx.path = '/logout'
    assert.strictEqual(ctx.url, '/logout')
    assert.strictEqual(ctx.originalUrl, '/login')
    assert.strictEqual(ctx.request.originalUrl, '/login')
  })

  tman.it('should not affect parseurl', function () {
    let ctx = context({url: '/login?foo=bar'})
    ctx.path = '/login'
    let url = parseurl(ctx.req)
    assert.strictEqual(url.path, '/login?foo=bar')
  })
})
