'use strict';

var gulp = require('gulp');
var  gulpSequence = require('gulp-sequence');
var  jshint = require('gulp-jshint');

gulp.task('jshint', function () {
  return gulp.src(['index.js', 'gulpfile.js', 'lib/*.js', 'examples/*.js', 'test/*.js', 'benchmark/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['test']);

gulp.task('test', gulpSequence('jshint'));
