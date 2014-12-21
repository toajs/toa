'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var request = require('supertest');
var assert = require('assert');
var toa = require('../..');

describe('ctx.state', function() {
  it('should provide a ctx.state namespace', function(done) {
    var app = toa();

    app.use(function(next) {
      assert.deepEqual(this.state, {});
      return next();
    });

    request(app.listen())
      .get('/')
      .expect(404)
      .end(done);
  });
});
