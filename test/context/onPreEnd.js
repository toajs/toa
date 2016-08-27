'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('supertest')
var toa = require('../..')

tman.suite('context onPreEnd', function () {
  tman.it('should run onPreEnd before context end', function (done) {
    var count = 0
    var app = toa(function () {
      this.body = 'test'
      assert.strictEqual(this.onPreEnd.length, 2)
      assert.strictEqual(count, 1)
      this.on('end', function () {
        assert.strictEqual(count, 2)
        count++
      })
    })

    app.use(function (next) {
      count++
      this.onPreEnd = function (done) {
        count++
        return done()
      }
      return next()
    })

    request(app.listen())
      .get('/')
      .expect(200)
      .end(function (err) {
        if (err) return done(err)
        assert.strictEqual(count, 3)
        done()
      })
  })

  tman.it('should add one more onPreEnd handler', function (done) {
    var count = 0
    var app = toa(function () {
      this.body = 'test'
      var queue = this.onPreEnd
      assert.strictEqual(queue.length, 3)
      assert.strictEqual(count, 1)
      this.on('end', function () {
        assert.strictEqual(count, 3)
        count++
      })
    })

    app.use(function (next) {
      count++
      this.onPreEnd = function (done) {
        count++
        return done()
      }
      this.onPreEnd = function (done) {
        count++
        return done()
      }
      return next()
    })

    request(app.listen())
      .get('/')
      .expect(200)
      .end(function (err) {
        if (err) return done(err)
        assert.strictEqual(count, 4)
        done()
      })
  })
})
