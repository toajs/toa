'use strict'

const tman = require('tman')
const assert = require('assert')
const thunks = require('thunks')
const request = require('supertest')
const Toa = require('../..')

tman.suite('context end', function () {
  tman.it('should respond body with context.end', function () {
    const app = new Toa()
    app.use(function () {
      this.body = 'Good job.'
      return this.thunk()(function () {
        this.end('test this.end')
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
  })

  tman.it('should not overwrite response body with context.end', function () {
    const app = new Toa()
    app.use(function () {
      return this.thunk()(function () {
        this.body = 'Good job.'
        this.end('test this.end')
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
  })

  tman.it('should not run next middleware with context.end', function () {
    const app = new Toa()

    app.use(function () {
      this.body = 'Good job.'
      this.end()
    })

    app.use(function () {
      assert.strictEqual('It should not run', true)
    })

    return request(app.listen())
      .get('/')
      .expect(200)
      .expect('Good job.')
  })

  tman.it('should work in nested thunks', function () {
    const thunk = thunks()
    const app = new Toa()
    app.use(function () {
      return this.thunk()(function () {
        return thunk.call(this)(function () {
          this.end('nested thunks')
        })
      })(function () {
        assert.strictEqual('It should not run', true)
        this.body = 'test'
      })
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  tman.it('after hooks should run only once when ctx.end()', function () {
    let called = 0

    const app = new Toa()
    app.use(function () {
      this.after(function () {
        called++
        this.end('end in after hooks')
      })
      this.end('end in body')
    })

    return request(app.listen())
      .get('/')
      .expect(200)
      .expect(function (res) {
        assert.strictEqual(called, 1)
      })
  })
})
