'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var response = require('../context').response
var fs = require('fs')

suite('res.body=', function () {
  suite('when Content-Type is set', function () {
    it('should not override', function () {
      var res = response()
      res.type = 'png'
      res.body = new Buffer('something')
      assert.strictEqual(res.header['content-type'], 'image/png')
    })

    suite('when body is an object', function () {
      it('should override as json', function () {
        var res = response()

        res.body = '<em>hey</em>'
        assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')

        res.body = {
          foo: 'bar'
        }
        assert.strictEqual(res.header['content-type'], 'application/json; charset=utf-8')
      })
    })

    it('should override length', function () {
      var res = response()
      res.type = 'html'
      res.body = 'something'
      assert.strictEqual(res.length, 9)
    })
  })

  suite('when a string is given', function () {
    it('should default to text', function () {
      var res = response()
      res.body = 'Tobi'
      assert.strictEqual(res.header['content-type'], 'text/plain; charset=utf-8')
    })

    it('should set length', function () {
      var res = response()
      res.body = 'Tobi'
      assert.strictEqual(res.header['content-length'], '4')
    })

    suite('and contains a non-leading <', function () {
      it('should default to text', function () {
        var res = response()
        res.body = 'aklsdjf < klajsdlfjasd'
        assert.strictEqual(res.header['content-type'], 'text/plain; charset=utf-8')
      })
    })
  })

  suite('when an html string is given', function () {
    it('should default to html', function () {
      var res = response()
      res.body = '<h1>Tobi</h1>'
      assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')
    })

    it('should set length', function () {
      var string = '<h1>Tobi</h1>'
      var res = response()
      res.body = string
      assert.strictEqual(res.length, Buffer.byteLength(string))
    })

    it('should set length when body is overridden', function () {
      var string = '<h1>Tobi</h1>'
      var res = response()
      res.body = string
      res.body = string + string
      assert.strictEqual(res.length, 2 * Buffer.byteLength(string))
    })

    suite('when it contains leading whitespace', function () {
      it('should default to html', function () {
        var res = response()
        res.body = '    <h1>Tobi</h1>'
        assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')
      })
    })
  })

  suite('when an xml string is given', function () {
    it('should default to html', function () {
      /**
       * This test is to show that we're not going
       * to be stricter with the html sniff
       * or that we will sniff other string types.
       * You should `.type=` if this simple test fails.
       */

      var res = response()
      res.body = '<?xml version="1.0" encoding="UTF-8"?>\n<俄语>данные</俄语>'
      assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')
    })
  })

  suite('when a stream is given', function () {
    it('should default to an octet stream', function () {
      var res = response()
      res.body = fs.createReadStream('LICENSE')
      assert.strictEqual(res.header['content-type'], 'application/octet-stream')
    })
  })

  suite('when a buffer is given', function () {
    it('should default to an octet stream', function () {
      var res = response()
      res.body = new Buffer('hey')
      assert.strictEqual(res.header['content-type'], 'application/octet-stream')
    })

    it('should set length', function () {
      var res = response()
      res.body = new Buffer('Tobi')
      assert.strictEqual(res.header['content-length'], '4')
    })
  })

  suite('when an object is given', function () {
    it('should default to json', function () {
      var res = response()
      res.body = {
        foo: 'bar'
      }
      assert.strictEqual(res.header['content-type'], 'application/json; charset=utf-8')
    })
  })
})
