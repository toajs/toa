'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response
const fs = require('fs')

tman.suite('res.length', function () {
  tman.suite('when Content-Length is defined', function () {
    tman.it('should return a number', function () {
      let res = response()
      res.header['content-length'] = '120'
      assert.strictEqual(res.length, 120)
    })
  })
})

tman.suite('res.length', function () {
  tman.suite('when Content-Length is defined', function () {
    tman.it('should return a number', function () {
      let res = response()
      res.set('Content-Length', '1024')
      assert.strictEqual(res.length, 1024)
    })
  })

  tman.suite('when Content-Length is not defined', function () {
    tman.suite('and a .body is set', function () {
      tman.it('should return a number', function () {
        let res = response()

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

    tman.suite('and .body is not', function () {
      tman.it('should return undefined', function () {
        let res = response()
        assert.strictEqual(res.length == null, true)
      })
    })
  })
})
