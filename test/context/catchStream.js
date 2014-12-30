'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var fs = require('fs');
var assert = require('assert');
var request = require('supertest');
var toa = require('../..');

describe('catch stream error', function() {
  it('should respond success', function(done) {
    var app = toa(function() {
      this.type = 'text';
      this.body = this.catchStream(fs.createReadStream(__dirname + '/catchStream.js', {
        encoding: 'utf8'
      }));
    });

    request(app.listen())
      .get('/')
      .expect(200)
      .end(done);
  });

  it('should respond 404', function(done) {
    var app = toa(function() {
      this.type = 'text';
      this.body = this.catchStream(fs.createReadStream(__dirname + '/none.js', {
        encoding: 'utf8'
      }));
    });

    request(app.listen())
      .get('/')
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        assert((res.res.statusMessage || res.res.text) === 'Not Found');
        done();
      });
  });
});
