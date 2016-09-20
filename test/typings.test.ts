'use strict'

// `tman -r ts-node/register test/typings.test.ts`

/// <reference path='../typings/index.d.ts' />

import * as http from 'http'
import * as assert from 'assert'
import { suite, it } from 'tman'
import { EventEmitter } from 'events'

import * as Toa from '../'
import { Toa as Toa1, NAME } from '../'

const supertest = require('supertest')

suite('toa typings', () => {
  it('toa exports', function () {
    assert.strictEqual(NAME, 'toa')
    assert.strictEqual(Toa.NAME, NAME)
    assert.strictEqual(Toa, Toa1)
  })

  it('application', function () {
    let app = new Toa(http.createServer())
    assert.ok(app instanceof Toa)

    app = new Toa(http.createServer(), function () {})
    assert.ok(app instanceof Toa)

    app = new Toa(http.createServer(), function () {}, function (err: Error) {})
    assert.ok(app instanceof Toa)

    app = new Toa(http.createServer(), function () {}, {onerror: function (err: Error) {}})
    assert.ok(app instanceof Toa)

    app = new Toa(function () {})
    assert.ok(app instanceof Toa)

    app = new Toa1(function () {})
    assert.ok(app instanceof Toa)

    app = new Toa(function () {}, function () {})
    assert.ok(app instanceof Toa)

    app = new Toa(function () {}, {onerror: function (err: Error) {}})
    assert.ok(app instanceof Toa)

    app = new Toa({onerror: function (err: Error) {}})
    assert.ok(app instanceof Toa)

    assert.ok(app.request)
    assert.ok(app.response)
    assert.ok(app.context)
    assert.ok(app.Context)
    assert.ok(app.config)
    assert.strictEqual(app.keys, null)
    assert.strictEqual(app.server, null)

    app.use(function () {})
    app.use(function * () {})
    app.use(function () { return Promise.resolve() })
    app.use(function (done) { done() })
    app.onerror = function (err: Error) {}
    app.listen()

    assert.ok(app.middleware instanceof Array)
    // assert.ok(app.server instanceof <any>http.Server)
    assert.ok(app.toListener())
  })

  it('request, response, context', function * () {
    let app = new Toa(function () {
      assert.strictEqual(this.request.__proto__, app.request)
      assert.strictEqual(this.response.__proto__, app.response)
      assert.strictEqual(this.__proto__, app.context)
      assert.ok(this instanceof <any>app.Context)
      assert.ok(this instanceof EventEmitter)

      assert.ok(this.res)
      assert.ok(this.req)
      assert.ok(this.accept)
      assert.ok(this.originalUrl)
      assert.ok(this.cookies)

      assert.ok(this.state)
      assert.ok(this.onerror)

      assert.strictEqual(this.respond, true)
      assert.strictEqual(this.ended, false)
      assert.strictEqual(this.finished, false)
      assert.strictEqual(this.closed, false)

      this.after(function () {})
      this.after(function * () {})
      this.after(function () { return Promise.resolve() })
      this.after(function (done) { done() })
      this.body = 'ok'
    })

    yield supertest(app.listen())
      .get('/')
      .expect(200)
      .expect('ok')
  })
})
