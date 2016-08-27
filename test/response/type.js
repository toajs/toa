'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.type=', function () {
  tman.suite('with a mime', function () {
    tman.it('should set the Content-Type', function () {
      var ctx = context()
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  tman.suite('with an extension', function () {
    tman.it('should lookup the mime', function () {
      var ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })
  })

  tman.suite('without a charset', function () {
    tman.it('should default the charset', function () {
      var ctx = context()
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })
  })

  tman.suite('with a charset', function () {
    tman.it('should not default the charset', function () {
      var ctx = context()
      ctx.type = 'text/html; charset=foo'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=foo')
    })
  })

  tman.suite('with an unknown extension', function () {
    tman.it('should not set a content-type', function () {
      var ctx = context()
      ctx.type = 'asdf'
      assert.strictEqual(ctx.type, '')
      assert.strictEqual(ctx.response.header['content-type'], undefined)
    })
  })
})

tman.suite('ctx.type', function () {
  tman.suite('with no Content-Type', function () {
    tman.it('should return ""', function () {
      var ctx = context()
      // TODO: this is lame
      assert.strictEqual(ctx.type, '')
    })
  })

  tman.suite('with a Content-Type', function () {
    tman.it('should return the mime', function () {
      var ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
    })
  })
})
