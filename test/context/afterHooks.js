'use strict'

const tman = require('tman')
const assert = require('assert')
const thunk = require('thunks')()
const request = require('supertest')
const Toa = require('../..')

tman.suite('context middleware after hooks', function () {
  tman.it('should run after hooks before context end', function () {
    let count = 0

    const app = new Toa()

    app.use(function () {
      assert.strictEqual(++count, 1)
      this.after(function (done) {
        assert.strictEqual(++count, 4)
        assert.throws(() => {
          this.after(function () {})
        })
        return done()
      })
    })

    app.use(function () {
      this.body = 'test'

      assert.strictEqual(++count, 2)
      this.on('end', function () {
        assert.strictEqual(++count, 5)
      })
      this.after(function () {
        assert.strictEqual(++count, 3)
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  tman.it('should support more after hook function styles', function () {
    let count = 0

    const app = new Toa()

    app.use(function () {
      assert.strictEqual(++count, 1)

      this.after(function * () {
        assert.ok(this instanceof app.Context)
        yield thunk.delay(10)
        assert.strictEqual(++count, 10)
      })
    })

    app.use(function () {
      assert.strictEqual(++count, 2)

      this.after(function (done) {
        assert.ok(this instanceof app.Context)
        thunk.delay(10)(function () {
          assert.strictEqual(++count, 9)
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
          assert.strictEqual(++count, 7)
        })
      })
    })

    app.use(function () {
      this.body = 'test'
      assert.strictEqual(++count, 5)

      this.after(function () {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 6)
      })

      this.on('end', function () {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 11)
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  tman.it('should be compatible with onPreEnd', function () {
    let count = 0

    const app = new Toa()

    app.use(function (next) {
      assert.strictEqual(++count, 1)

      this.onPreEnd = function (done) {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 4)
        done()
      }
      next()
    })

    app.use(function () {
      this.body = 'test'

      assert.strictEqual(++count, 2)
      this.on('end', function () {
        assert.strictEqual(++count, 5)
      })

      this.onPreEnd = function () {
        assert.ok(this instanceof app.Context)
        assert.strictEqual(++count, 3)
      }
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })
})
