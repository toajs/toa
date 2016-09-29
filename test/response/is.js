'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('response.is(type)', function () {
  tman.it('should ignore params', function () {
    let res = context().response
    res.type = 'text/html; charset=utf-8'

    assert.strictEqual(res.is('text/*'), 'text/html')
  })

  tman.suite('when no type is set', function () {
    tman.it('should return false', function () {
      let res = context().response

      assert.strictEqual(res.is(), false)
      assert.strictEqual(res.is('html'), false)
    })
  })

  tman.suite('when given no types', function () {
    tman.it('should return the type', function () {
      let res = context().response
      res.type = 'text/html; charset=utf-8'

      assert.strictEqual(res.is(), 'text/html')
    })
  })

  tman.suite('given one type', function () {
    tman.it('should return the type or false', function () {
      let res = context().response
      res.type = 'image/png'

      assert.strictEqual(res.is('png'), 'png')
      assert.strictEqual(res.is('.png'), '.png')
      assert.strictEqual(res.is('image/png'), 'image/png')
      assert.strictEqual(res.is('image/*'), 'image/png')
      assert.strictEqual(res.is('*/png'), 'image/png')

      assert.strictEqual(res.is('jpeg'), false)
      assert.strictEqual(res.is('.jpeg'), false)
      assert.strictEqual(res.is('image/jpeg'), false)
      assert.strictEqual(res.is('text/*'), false)
      assert.strictEqual(res.is('*/jpeg'), false)
    })
  })

  tman.suite('given multiple types', function () {
    tman.it('should return the first match or false', function () {
      let res = context().response
      res.type = 'image/png'

      assert.strictEqual(res.is('png'), 'png')
      assert.strictEqual(res.is('.png'), '.png')
      assert.strictEqual(res.is('text/*', 'image/*'), 'image/png')
      assert.strictEqual(res.is('image/*', 'text/*'), 'image/png')
      assert.strictEqual(res.is('image/*', 'image/png'), 'image/png')
      assert.strictEqual(res.is('image/png', 'image/*'), 'image/png')

      assert.strictEqual(res.is(['text/*', 'image/*']), 'image/png')
      assert.strictEqual(res.is(['image/*', 'text/*']), 'image/png')
      assert.strictEqual(res.is(['image/*', 'image/png']), 'image/png')
      assert.strictEqual(res.is(['image/png', 'image/*']), 'image/png')

      assert.strictEqual(res.is('jpeg'), false)
      assert.strictEqual(res.is('.jpeg'), false)
      assert.strictEqual(res.is('text/*', 'application/*'), false)
      assert.strictEqual(res.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false)
    })
  })

  tman.suite('when Content-Type: application/x-www-form-urlencoded', function () {
    tman.it('should match "urlencoded"', function () {
      let res = context().response
      res.type = 'application/x-www-form-urlencoded'

      assert.strictEqual(res.is('urlencoded'), 'urlencoded')
      assert.strictEqual(res.is('json', 'urlencoded'), 'urlencoded')
      assert.strictEqual(res.is('urlencoded', 'json'), 'urlencoded')
    })
  })
})
