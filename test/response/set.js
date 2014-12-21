'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var assert = require('assert');
var context = require('../context');

describe('ctx.set(name, val)', function() {
  it('should set a field value', function() {
    var ctx = context();
    ctx.set('x-foo', 'bar');
    assert(ctx.response.header['x-foo'] === 'bar');
  });

  it('should coerce to a string', function() {
    var ctx = context();
    ctx.set('x-foo', 5);
    assert(ctx.response.header['x-foo'] === '5');
  });

  it('should set a field value of array', function() {
    var ctx = context();
    ctx.set('x-foo', ['foo', 'bar']);
    assert.deepEqual(ctx.response.header['x-foo'], ['foo', 'bar']);
  });
});

describe('ctx.set(object)', function() {
  it('should set multiple fields', function() {
    var ctx = context();

    ctx.set({
      foo: '1',
      bar: '2'
    });

    assert(ctx.response.header.foo === '1');
    assert(ctx.response.header.bar === '2');
  });
});
