'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.inspect()', function () {
  it('should return a json representation', function () {
    var ctx = context()
    var toJSON = ctx.toJSON(ctx)

    assert.deepEqual(toJSON, ctx.inspect())
  })
})
