'use strict'

const tman = require('tman')
const context = require('../context')
const assert = require('assert')

tman.suite('ctx.is(type)', function () {
  tman.it('should ignore params', function () {
    const ctx = context()
    ctx.header['content-type'] = 'text/html; charset=utf-8'
    ctx.header['transfer-encoding'] = 'chunked'

    assert.strictEqual(ctx.is('text/*'), 'text/html')
  })

  tman.suite('when no body is given', function () {
    tman.it('should return null', function () {
      const ctx = context()

      assert.strictEqual(ctx.is() == null, true)
      assert.strictEqual(ctx.is('image/*') == null, true)
      assert.strictEqual(ctx.is('image/*', 'text/*') == null, true)
    })
  })

  tman.suite('when no content type is given', function () {
    tman.it('should return false', function () {
      const ctx = context()
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is(), false)
      assert.strictEqual(ctx.is('image/*'), false)
      assert.strictEqual(ctx.is('text/*', 'image/*'), false)
    })
  })

  tman.suite('give no types', function () {
    tman.it('should return the mime type', function () {
      const ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is(), 'image/png')
    })
  })

  tman.suite('given one type', function () {
    tman.it('should return the type or false', function () {
      const ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('png'), 'png')
      assert.strictEqual(ctx.is('.png'), '.png')
      assert.strictEqual(ctx.is('image/png'), 'image/png')
      assert.strictEqual(ctx.is('image/*'), 'image/png')
      assert.strictEqual(ctx.is('*/png'), 'image/png')

      assert.strictEqual(ctx.is('jpeg'), false)
      assert.strictEqual(ctx.is('.jpeg'), false)
      assert.strictEqual(ctx.is('image/jpeg'), false)
      assert.strictEqual(ctx.is('text/*'), false)
      assert.strictEqual(ctx.is('*/jpeg'), false)
    })
  })

  tman.suite('given multiple types', function () {
    tman.it('should return the first match or false', function () {
      const ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('png'), 'png')
      assert.strictEqual(ctx.is('.png'), '.png')
      assert.strictEqual(ctx.is('text/*', 'image/*'), 'image/png')
      assert.strictEqual(ctx.is('image/*', 'text/*'), 'image/png')
      assert.strictEqual(ctx.is('image/*', 'image/png'), 'image/png')
      assert.strictEqual(ctx.is('image/png', 'image/*'), 'image/png')

      assert.strictEqual(ctx.is(['text/*', 'image/*']), 'image/png')
      assert.strictEqual(ctx.is(['image/*', 'text/*']), 'image/png')
      assert.strictEqual(ctx.is(['image/*', 'image/png']), 'image/png')
      assert.strictEqual(ctx.is(['image/png', 'image/*']), 'image/png')

      assert.strictEqual(ctx.is('jpeg'), false)
      assert.strictEqual(ctx.is('.jpeg'), false)
      assert.strictEqual(ctx.is('text/*', 'application/*'), false)
      assert.strictEqual(ctx.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false)
    })
  })

  tman.suite('when Content-Type: application/x-www-form-urlencoded', function () {
    tman.it('should match "urlencoded"', function () {
      const ctx = context()
      ctx.header['content-type'] = 'application/x-www-form-urlencoded'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('urlencoded'), 'urlencoded')
      assert.strictEqual(ctx.is('json', 'urlencoded'), 'urlencoded')
      assert.strictEqual(ctx.is('urlencoded', 'json'), 'urlencoded')
    })
  })
})
