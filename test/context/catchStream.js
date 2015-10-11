'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
/*global describe, it */

var fs = require('fs')
var assert = require('assert')
var request = require('supertest')
var toa = require('../..')

describe('catch stream error', function () {
  it('should respond success', function () {
    var app = toa(function () {
      this.type = 'text'
      this.body = this.catchStream(fs.createReadStream(__dirname + '/catchStream.js', {
        encoding: 'utf8'
      }))
    })

    return request(app.listen())
      .get('/')
      .expect(200)
  })

  it('should respond 404', function () {
    var app = toa(function () {
      this.type = 'text'
      this.body = this.catchStream(fs.createReadStream(__dirname + '/none.js', {
        encoding: 'utf8'
      }))
    })

    return request(app.listen())
      .get('/')
      .expect(404)
      .expect(function (res) {
        assert.strictEqual(res.res.statusMessage || res.res.text, 'Not Found')
      })
  })
})
