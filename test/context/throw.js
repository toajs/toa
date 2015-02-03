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

describe('ctx.throw(msg)', function() {
  it('should set .status to 500', function(done) {
    var ctx = context();

    try {
      ctx.throw('boom');
    } catch (err) {
      assert(err.status === 500);
      assert(!err.expose);
      done();
    }
  });
});

describe('ctx.throw(err)', function() {
  it('should set .status to 500', function(done) {
    var ctx = context();
    var err = new Error('test');

    try {
      ctx.throw(err);
    } catch (err) {
      assert(err.status === 500);
      assert(err.message === 'test');
      assert(!err.expose);
      done();
    }
  });
});

describe('ctx.throw(err, status)', function() {
  it('should throw the error and set .status', function(done) {
    var ctx = context();
    var error = new Error('test');

    try {
      ctx.throw(error, 422);
    } catch (err) {
      assert(err.status === 422);
      assert(err.message === 'test');
      assert(err.expose === true);
      done();
    }
  });
});

describe('ctx.throw(status, err)', function() {
  it('should throw the error and set .status', function(done) {
    var ctx = context();
    var error = new Error('test');

    try {
      ctx.throw(422, error);
    } catch (err) {
      assert(err.status === 422);
      assert(err.message === 'test');
      assert(err.expose);
      done();
    }
  });
});

describe('ctx.throw(msg, status)', function() {
  it('should throw an error', function(done) {
    var ctx = context();

    try {
      ctx.throw('name required', 400);
    } catch (err) {
      assert(err.message === 'name required');
      assert(err.status === 400);
      assert(err.expose);
      done();
    }
  });
});

describe('ctx.throw(status, msg)', function() {
  it('should throw an error', function(done) {
    var ctx = context();

    try {
      ctx.throw(400, 'name required');
    } catch (err) {
      assert(err.message === 'name required');
      assert(err.status === 400);
      assert(err.expose);
      done();
    }
  });
});

describe('ctx.throw(status)', function() {
  it('should throw an error', function(done) {
    var ctx = context();

    try {
      ctx.throw(400);
    } catch (err) {
      assert(err.message === 'Bad Request');
      assert(err.status === 400);
      assert(err.expose);
      done();
    }
  });

  describe('when not valid status', function() {
    it('should not expose', function(done) {
      var ctx = context();

      try {
        var err = new Error('some error');
        err.status = -1;
        ctx.throw(err);
      } catch (err) {
        assert(err.message === 'some error');
        assert(!err.expose);
        done();
      }
    });
  });
});

describe('ctx.throw(status, msg, props)', function() {
  it('should mixin props', function(done) {
    var ctx = context();

    try {
      ctx.throw(400, 'msg', {
        prop: true
      });
    } catch (err) {
      assert(err.message === 'msg');
      assert(err.status === 400);
      assert(err.expose);
      assert(err.prop);
      done();
    }
  });

  describe('when props include status', function() {
    it('should be ignored', function(done) {
      var ctx = context();

      try {
        ctx.throw(400, 'msg', {
          prop: true
          // status: -1
        });
      } catch (err) {
        assert(err.message === 'msg');
        assert(err.status === 400);
        assert(err.expose);
        assert(err.prop);
        done();
      }
    });
  });
});

describe('ctx.throw(msg, props)', function() {
  it('should mixin props', function(done) {
    var ctx = context();

    try {
      ctx.throw('msg', {
        prop: true
      });
    } catch (err) {
      assert(err.message === 'msg');
      assert(err.status === 500);
      assert(err.expose === false);
      assert(err.prop);
      done();
    }
  });
});

describe('ctx.throw(status, props)', function() {
  it('should mixin props', function(done) {
    var ctx = context();

    try {
      ctx.throw(400, {
        prop: true
      });
    } catch (err) {
      assert(err.message === 'Bad Request');
      assert(err.status === 400);
      assert(err.expose);
      assert(err.prop);
      done();
    }
  });
});

describe('ctx.throw(err, props)', function() {
  it('should mixin props', function(done) {
    var ctx = context();

    try {
      ctx.throw(new Error('test'), {
        prop: true
      });
    } catch (err) {
      assert(err.message === 'test');
      assert(err.status === 500);
      assert(err.expose === false);
      assert(err.prop);
      done();
    }
  });
});
