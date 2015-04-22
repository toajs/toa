'use strict';

var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('jshint', function () {
  return gulp.src(['index.js', 'gulpfile.js', 'lib/*.js', 'examples/*.js', 'test/*.js', 'benchmark/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('mocha', function () {
  return gulp.src(['test/index.js', 'test/context/*', 'test/request/*', 'test/response/*'], {read: false})
    .pipe(mocha());
});

gulp.task('default', ['test']);

gulp.task('exit', function(callback) {
  callback();
  process.exit(0);
});

gulp.task('test', gulpSequence('jshint', 'mocha', 'exit'));
