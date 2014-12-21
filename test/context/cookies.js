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

describe('ctx.cookies.set()', function() {
  it('should set an unsigned cookie', function(done) {
    var app = toa();

    app.use(function(next) {
      this.cookies.set('name', 'jon');
      this.status = 204;
      return next();
    });

    request(app.listen(3000))
      .get('/')
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);

        assert(res.headers['set-cookie'].some(function(cookie) {
          return /^name=/.test(cookie);
        }));
        done();
      });
  });

  describe('with .signed', function() {
    describe('when no .keys are set', function() {
      it('should error', function(done) {
        var app = toa();
        app.keys = null;

        app.use(function(next) {
          try {
            this.cookies.set('foo', 'bar', {
              signed: true
            });
          } catch (err) {
            this.body = err.message;
          }
          return next();
        });

        request(app.listen())
          .get('/')
          .expect('.keys required for signed cookies', done);
      });
    });

    it('should send a signed cookie', function(done) {
      var app = toa();

      app.use(function(next) {
        this.cookies.set('name', 'jon', {
          signed: true
        });
        this.status = 204;
        return next();
      });

      request(app.listen())
        .get('/')
        .expect(204)
        .end(function(err, res) {
          if (err) return done(err);

          var cookies = res.headers['set-cookie'];

          assert(cookies.some(function(cookie) {
            return /^name=/.test(cookie);
          }));

          assert(cookies.some(function(cookie) {
            return /^name\.sig=/.test(cookie);
          }));

          done();
        });
    });
  });
});
