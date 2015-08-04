'use strict'

var gulp = require('gulp')
var merge = require('merge2')
var gUtil = require('gulp-util')
var mocha = require('gulp-mocha')
var through = require('through2')
var istanbul = require('gulp-istanbul')
var gulpSequence = require('gulp-sequence')

gulp.task('mocha', function (done) {
  return merge(
    gulp.src(['index.js', 'lib/*.js'])
      .pipe(istanbul()) // Covering files
      .pipe(istanbul.hookRequire()), // Force `require` to return covered files
    gulp.src(['test/index.js', 'test/context/*', 'test/request/*', 'test/response/*'])
      .pipe(mocha({timeout: 10000}))
      .pipe(istanbul.writeReports()) // Creating the reports after tests runned
      .pipe(istanbul.enforceThresholds({thresholds: {global: 90}})) // Enforce a coverage of at least 90%
  )
})

gulp.task('docs', function () {
  var guide = ''
  return gulp.src([
    'docs/api/application.md',
    'docs/api/context.md',
    'docs/api/request.md',
    'docs/api/response.md'
  ])
    .pipe(through.obj(function (file, code, next) {
      guide += file.contents.toString() + '\n\n------\n\n'
      next()
    }, function (callback) {
      this.push(new gUtil.File({path: __dirname, contents: new Buffer(guide)}))
      callback()
    }))
    .pipe(gulp.dest('docs/guide.md'))
})

gulp.task('default', gulpSequence('test', 'docs'))

gulp.task('exit', function (callback) {
  callback()
  process.exit(0)
})

gulp.task('test', gulpSequence('mocha', 'exit'))
