'use strict'

var gulp = require('gulp')
var gUtil = require('gulp-util')
var through = require('through2')

gulp.task('docs', function () {
  var guide = ''
  return gulp.src([
    'doc/api/application.md',
    'doc/api/context.md',
    'doc/api/request.md',
    'doc/api/response.md'
  ])
    .pipe(through.obj(function (file, code, next) {
      guide += file.contents.toString() + '\n\n------\n\n'
      next()
    }, function (callback) {
      this.push(new gUtil.File({path: __dirname, contents: new Buffer(guide)}))
      callback()
    }))
    .pipe(gulp.dest('doc/guide.md'))
})

gulp.task('default', ['docs'])
