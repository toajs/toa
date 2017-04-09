'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response
const fs = require('fs')

tman.suite('res.body=', function () {
  tman.suite('when Content-Type is set', function () {
    tman.it('should not override', function () {
      let res = response()
      res.type = 'png'
      res.body = Buffer.from('something')
      assert.strictEqual(res.header['content-type'], 'image/png')
    })

    tman.suite('when body is an object', function () {
      tman.it('should override as json', function () {
        let res = response()

        res.body = '<em>hey</em>'
        assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')

        res.body = {
          foo: 'bar'
        }
        assert.strictEqual(res.header['content-type'], 'application/json; charset=utf-8')
      })
    })

    tman.it('should override length', function () {
      let res = response()
      res.type = 'html'
      res.body = 'something'
      assert.strictEqual(res.length, 9)
    })
  })

  tman.suite('when a string is given', function () {
    tman.it('should default to text', function () {
      let res = response()
      res.body = 'Tobi'
      assert.strictEqual(res.header['content-type'], 'text/plain; charset=utf-8')
    })

    tman.it('should set length', function () {
      let res = response()
      res.body = 'Tobi'
      assert.strictEqual(res.header['content-length'], '4')
    })

    tman.suite('and contains a non-leading <', function () {
      tman.it('should default to text', function () {
        let res = response()
        res.body = 'aklsdjf < klajsdlfjasd'
        assert.strictEqual(res.header['content-type'], 'text/plain; charset=utf-8')
      })
    })
  })

  tman.suite('when an html string is given', function () {
    tman.it('should default to html', function () {
      let res = response()
      res.body = '<h1>Tobi</h1>'
      assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')
    })

    tman.it('should set length', function () {
      let string = '<h1>Tobi</h1>'
      let res = response()
      res.body = string
      assert.strictEqual(res.length, Buffer.byteLength(string))
    })

    tman.it('should set length when body is overridden', function () {
      let string = '<h1>Tobi</h1>'
      let res = response()
      res.body = string
      res.body = string + string
      assert.strictEqual(res.length, 2 * Buffer.byteLength(string))
    })

    tman.suite('when it contains leading whitespace', function () {
      tman.it('should default to html', function () {
        let res = response()
        res.body = '    <h1>Tobi</h1>'
        assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')
      })
    })
  })

  tman.suite('when an xml string is given', function () {
    tman.it('should default to html', function () {
      /**
       * This test is to show that we're not going
       * to be stricter with the html sniff
       * or that we will sniff other string types.
       * You should `.type=` if this simple test fails.
       */

      let res = response()
      res.body = '<?xml version="1.0" encoding="UTF-8"?>\n<俄语>данные</俄语>'
      assert.strictEqual(res.header['content-type'], 'text/html; charset=utf-8')
    })
  })

  tman.suite('when a stream is given', function () {
    tman.it('should default to an octet stream', function () {
      let res = response()
      res.body = fs.createReadStream('LICENSE')
      assert.strictEqual(res.header['content-type'], 'application/octet-stream')
    })
  })

  tman.suite('when a buffer is given', function () {
    tman.it('should default to an octet stream', function () {
      let res = response()
      res.body = Buffer.from('hey')
      assert.strictEqual(res.header['content-type'], 'application/octet-stream')
    })

    tman.it('should set length', function () {
      let res = response()
      res.body = Buffer.from('Tobi')
      assert.strictEqual(res.header['content-length'], '4')
    })
  })

  tman.suite('when an object is given', function () {
    tman.it('should default to json', function () {
      let res = response()
      res.body = {
        foo: 'bar'
      }
      assert.strictEqual(res.header['content-type'], 'application/json; charset=utf-8')
    })
  })
})
