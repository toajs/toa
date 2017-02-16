'use strict'

const tman = require('tman')
const request = require('supertest')
const assert = require('assert')
const Toa = require('../..')

tman.suite('ctx.state', function () {
  tman.it('should provide a ctx.state namespace', function () {
    const app = new Toa()

    app.use(function (next) {
      assert.deepEqual(this.state, {})
      return next()
    })

    return request(app.listen())
      .get('/')
      .expect(421)
  })
})
