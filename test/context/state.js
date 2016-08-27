'use strict'

var tman = require('tman')
var request = require('supertest')
var assert = require('assert')
var toa = require('../..')

tman.suite('ctx.state', function () {
  tman.it('should provide a ctx.state namespace', function () {
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
