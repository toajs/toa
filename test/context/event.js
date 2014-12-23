'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var assert = require('assert');
var request = require('supertest');
var toa = require('../..');

describe('context event', function() {
  it('should emit end', function(done) {
    var resEnd = false;
    var app = toa(function() {
      this.body = 'test';
      this.on('end', function() {
        resEnd = !resEnd;
      });
    });

    request(app.listen(3000))
      .get('/')
      .expect(200)
      .end(function(err) {
        if (err) return done(err);
        assert(resEnd);
        done();
      });
  });

  it('should emit end while 404', function(done) {
    var resEnd = false;
    var app = toa(function() {
      this.on('end', function() {
        resEnd = !resEnd;
      });
      this.throw(404);
    });

    request(app.listen(3000))
      .get('/')
      .expect(404)
      .end(function(err) {
        if (err) return done(err);
        assert(resEnd);
        done();
      });
  });

  it('should emit end while any error', function(done) {
    var resEnd = false;
    var app = toa(function() {
      this.on('end', function() {
        resEnd = !resEnd;
      });
      throw new Error('some error');
    });

    app.onerror = function(err) {};

    request(app.listen(3000))
      .get('/')
      .expect(500)
      .end(function(err) {
        if (err) return done(err);
        assert(resEnd);
        done();
      });
  });
});
