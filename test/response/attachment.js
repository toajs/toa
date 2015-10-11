'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')
var request = require('supertest')
var toa = require('../..')

describe('ctx.attachment([filename])', function () {
  describe('when given a filename', function () {
    it('should set the filename param', function () {
      var ctx = context()
      ctx.attachment('path/to/tobi.png')
      var str = 'attachment; filename="tobi.png"'
      assert.strictEqual(ctx.response.header['content-disposition'], str)
    })
  })

  describe('when omitting filename', function () {
    it('should not set filename param', function () {
      var ctx = context()
      ctx.attachment()
      assert.strictEqual(ctx.response.header['content-disposition'], 'attachment')
    })
  })

  describe('when given a no-ascii filename', function () {
    it('should set the encodeURI filename param', function () {
      var ctx = context()
      ctx.attachment('path/to/include-no-ascii-char-中文名-ok.png')
      var str = 'attachment; filename="include-no-ascii-char-???-ok.png"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.png'
      assert.strictEqual(ctx.response.header['content-disposition'], str)
    })

    it('should work with http client', function () {
      var app = toa()

      app.use(function (next) {
        this.attachment('path/to/include-no-ascii-char-中文名-ok.json')
        this.body = {
          foo: 'bar'
        }
        return next()
      })

      return request(app.listen())
        .get('/')
        .expect('content-disposition', 'attachment; filename="include-no-ascii-char-???-ok.json"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.json')
        .expect({
          foo: 'bar'
        })
        .expect(200)
    })
  })
})
