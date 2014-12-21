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

describe('ctx.toJSON()', function(){
  it('should return a json representation', function(){
    var ctx = context();

    ctx.req.method = 'POST';
    ctx.req.url = '/items';
    ctx.req.headers['content-type'] = 'text/plain';
    ctx.status = 200;
    ctx.body = '<p>Hey</p>';

    var obj = JSON.parse(JSON.stringify(ctx));
    var req = obj.request;
    var res = obj.response;

    assert.deepEqual(req, {
      method: 'POST',
      url: '/items',
      header: {
        'content-type': 'text/plain'
      }
    });

    assert.deepEqual(res, {
      status: 200,
      message: 'OK',
      header: {
        'content-type': 'text/html; charset=utf-8',
        'content-length': '10'
      }
    });
  });
});
