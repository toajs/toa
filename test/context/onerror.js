'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var assert = require('assert');
var request = require('supertest');
var toa = require('../..');

describe('catch error', function() {
  it('should respond', function(done) {
    var app = toa();

    app.use(function(next) {
      this.body = 'something else';

      this.throw(418, 'boom');
      return next();
    });

    request(app.listen(3000))
      .get('/')
      .expect(418)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Content-Length', '4')
      .end(done);
  });

  it('should unset all headers', function(done) {
    var app = toa();

    app.use(function(next) {
      this.set('Vary', 'Accept-Encoding');
      this.set('X-CSRF-Token', 'asdf');
      this.body = 'response';

      this.throw(418, 'boom');
      return next();
    });

    request(app.listen(3000))
      .get('/')
      .expect(418)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Content-Length', '4')
      .end(function(err, res) {
        if (err) return done(err);

        assert(res.headers.vary === undefined);
        assert(res.headers['x-csrf-token'] === undefined);
        done();
      });
  });

  describe('when invalid err.status', function() {
    describe('not number', function() {
      it('should respond 500', function(done) {
        var app = toa();

        app.use(function(next) {
          this.body = 'something else';
          var err = new Error('some error');
          err.status = 'notnumber';
          throw err;
        });

        app.onerror = function() {};

        request(app.listen(3000))
          .get('/')
          .expect(500)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Internal Server Error', done);
      });
    });

    describe('not http status code', function() {
      it('should respond 500', function(done) {
        var app = toa();

        app.use(function(next) {
          this.body = 'something else';
          var err = new Error('some error');
          err.status = 9999;
          throw err;
        });

        app.onerror = function() {};

        request(app.listen(3000))
          .get('/')
          .expect(500)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Internal Server Error', done);
      });
    });
  });
});
