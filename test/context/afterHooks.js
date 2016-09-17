'use strict'

var tman = require('tman')
var assert = require('assert')
var thunk = require('thunks')()
var request = require('supertest')
var toa = require('../..')

tman.suite('context middleware after hooks', function () {
  tman.it('should run after hooks before context end', function () {
    var count = 0

    var app = toa(function () {
      this.body = 'test'

      assert.strictEqual(++count, 2)
      this.on('end', function () {
        assert.strictEqual(++count, 5)
      })
      assert.strictEqual(this.after(function () {
        assert.strictEqual(++count, 4)
      }), 3)
    })

    app.use(function () {
      assert.strictEqual(++count, 1)
      assert.strictEqual(this.after(function (done) {
        assert.strictEqual(++count, 3)
        return done()
      }), 2)
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  tman.it('should support more after hook function styles', function () {
    var count = 0

    var app = toa(function () {
      this.body = 'test'
      assert.strictEqual(++count, 5)

      this.after(function () {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 10)
      })

      this.on('end', function () {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 11)
      })
    })

    app.use(function () {
      assert.strictEqual(++count, 1)

      this.after(function * () {
        assert.ok(this instanceof app.Context)
        yield thunk.delay(10)
        assert.strictEqual(++count, 6)
      })
    })

    app.use(function () {
      assert.strictEqual(++count, 2)

      this.after(function (done) {
        assert.ok(this instanceof app.Context)
        thunk.delay(10)(function () {
          assert.strictEqual(++count, 7)
        })(done)
      })
    })

    app.use(function () {
      assert.strictEqual(++count, 3)

      this.after(function () {
        assert.ok(this instanceof app.Context)
        return Promise.resolve().then(function () {
          assert.strictEqual(++count, 8)
        })
      })
    })

    app.use(function () {
      assert.strictEqual(++count, 4)

      this.after(function () {
        assert.ok(this instanceof app.Context)
        return thunk.delay(10)(function () {
          assert.strictEqual(++count, 9)
        })
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  tman.it('should be compatible with onPreEnd', function () {
    var count = 0

    var app = toa(function () {
      this.body = 'test'

      assert.strictEqual(++count, 2)
      this.on('end', function () {
        assert.strictEqual(++count, 5)
      })

      this.onPreEnd = function () {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 4)
      }
    })

    app.use(function (next) {
      assert.strictEqual(++count, 1)

      this.onPreEnd = function (done) {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 3)
        done()
      }
      next()
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })
})
