'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.toJSON()', function () {
  tman.it('should return a json representation', function () {
    let ctx = context()

    ctx.req.method = 'POST'
    ctx.req.url = '/items'
    ctx.req.headers['content-type'] = 'text/plain'
    ctx.status = 200
    ctx.body = '<p>Hey</p>'

    let obj = JSON.parse(JSON.stringify(ctx))
    let req = obj.request
    let res = obj.response

    assert.deepStrictEqual(req, {
      method: 'POST',
      url: '/items',
      header: {
        'content-type': 'text/plain'
      }
    })

    assert.deepStrictEqual(res, {
      status: 200,
      message: 'OK',
      header: {
        'content-type': 'text/html; charset=utf-8',
        'content-length': '10'
      }
    })
  })
})
