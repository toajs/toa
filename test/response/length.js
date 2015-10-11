'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var response = require('../context').response
var fs = require('fs')

describe('res.length', function () {
  describe('when Content-Length is defined', function () {
    it('should return a number', function () {
      var res = response()
      res.header['content-length'] = '120'
      assert.strictEqual(res.length, 120)
    })
  })
})

describe('res.length', function () {
  describe('when Content-Length is defined', function () {
    it('should return a number', function () {
      var res = response()
      res.set('Content-Length', '1024')
      assert.strictEqual(res.length, 1024)
    })
  })

  describe('when Content-Length is not defined', function () {
    describe('and a .body is set', function () {
      it('should return a number', function () {
        var res = response()

        res.body = 'foo'
        res.remove('Content-Length')
        assert.strictEqual(res.length, 3)

        res.body = 'foo'
        assert.strictEqual(res.length, 3)

        res.body = new Buffer('foo bar')
        res.remove('Content-Length')
        assert.strictEqual(res.length, 7)

        res.body = new Buffer('foo bar')
        assert.strictEqual(res.length, 7)

        res.body = {
          hello: 'world'
        }
        res.remove('Content-Length')
        assert.strictEqual(res.length, 17)

        res.body = {
          hello: 'world'
        }
        assert.strictEqual(res.length, 17)

        res.body = fs.createReadStream('package.json')
        assert.strictEqual(res.length == null, true)

        res.body = null
        assert.strictEqual(res.length == null, true)
      })
    })

    describe('and .body is not', function () {
      it('should return undefined', function () {
        var res = response()
        assert.strictEqual(res.length == null, true)
      })
    })
  })
})
