'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var request = require('supertest')
var toa = require('../..')

describe('context event', function () {
  describe('"end" event', function () {
    it('should emit "end"', function (done) {
      var resEnd = false
      var app = toa(function () {
        this.body = 'test'
        this.on('end', function () {
          resEnd = !resEnd
        })
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          done()
        })
    })

    it('should emit "end" while 404', function (done) {
      var resEnd = false
      var app = toa(function () {
        this.on('end', function () {
          resEnd = !resEnd
        })
        this.throw(404)
      })

      request(app.listen())
        .get('/')
        .expect(404)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          done()
        })
    })

    it('should emit "end" while any error', function (done) {
      var resEnd = false
      var app = toa(function () {
        this.on('end', function () {
          resEnd = !resEnd
        })
        throw new Error('some error')
      })

      app.onerror = function () {}

      request(app.listen())
        .get('/')
        .expect(500)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          done()
        })
    })

    it('should emit "end" if ctx.respond === false', function (done) {
      var resEnd = false
      var app = toa(function () {
        this.on('end', function () {
          resEnd = !resEnd
        })
        this.status = 200
        this.respond = false
        this.res.end('respond')
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert.strictEqual(resEnd, true)
          assert.strictEqual(res.text, 'respond')
          done()
        })
    })
  })

  describe('"finish" event', function () {
    it('should emit "finish"', function (done) {
      var finished = null
      var app = toa(function () {
        this.body = 'test'
        this.on('finish', function () {
          finished = this._finished
        })
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(finished, true)
          done()
        })
    })

    it('should emit "finish" while 404', function (done) {
      var finished = null
      var app = toa(function () {
        this.on('finish', function () {
          finished = this._finished
        })
        this.throw(404)
      })

      request(app.listen())
        .get('/')
        .expect(404)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(finished, true)
          done()
        })
    })

    it('should emit "finish" while any error', function (done) {
      var finished = null
      var app = toa(function () {
        this.on('finish', function () {
          finished = this._finished
        })
        throw new Error('some error')
      })

      app.onerror = function () {}

      request(app.listen())
        .get('/')
        .expect(500)
        .end(function (err) {
          if (err) return done(err)
          assert.strictEqual(finished, true)
          done()
        })
    })

    it('should emit "finish" after "end"', function (done) {
      var ended = false
      var finished = null
      var app = toa(function () {
        this.on('finish', function () {
          assert.strictEqual(ended, true)
          finished = this._finished
        })
        this.on('end', function () {
          ended = !ended
        })
        this.body = 'body'
      })

      request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          assert.strictEqual(res.text, 'body')
          assert.strictEqual(finished, true)
          done()
        })
    })
  })
})
