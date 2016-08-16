'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var request = require('supertest')
var assert = require('assert')
var toa = require('../..')

suite('ctx.state', function () {
  it('should provide a ctx.state namespace', function () {
    var app = toa()

    app.use(function (next) {
      assert.deepEqual(this.state, {})
      return next()
    })

    return request(app.listen())
      .get('/')
      .expect(404)
  })
})
