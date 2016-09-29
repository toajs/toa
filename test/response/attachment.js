'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')
const request = require('supertest')
const toa = require('../..')

tman.suite('ctx.attachment([filename])', function () {
  tman.suite('when given a filename', function () {
    tman.it('should set the filename param', function () {
      let ctx = context()
      ctx.attachment('path/to/tobi.png')
      let str = 'attachment; filename="tobi.png"'
      assert.strictEqual(ctx.response.header['content-disposition'], str)
    })
  })

  tman.suite('when omitting filename', function () {
    tman.it('should not set filename param', function () {
      let ctx = context()
      ctx.attachment()
      assert.strictEqual(ctx.response.header['content-disposition'], 'attachment')
    })
  })

  tman.suite('when given a no-ascii filename', function () {
    tman.it('should set the encodeURI filename param', function () {
      let ctx = context()
      ctx.attachment('path/to/include-no-ascii-char-中文名-ok.png')
      let str = 'attachment; filename="include-no-ascii-char-???-ok.png"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.png'
      assert.strictEqual(ctx.response.header['content-disposition'], str)
    })

    tman.it('should work with http client', function () {
      const app = toa()

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
