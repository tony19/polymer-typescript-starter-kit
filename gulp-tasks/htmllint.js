const $ = require('gulp-load-plugins')();
const gulp = require('gulp');

function htmllint() {
  return gulp.src('src/**/*.html')
    .pipe($.debug({title: 'htmllint'}))
    .pipe($.htmlLint())
    .pipe($.htmlLint.format())
    .pipe($.htmlLint.failOnError());
}

gulp.task('htmllint', htmllint);
module.exports = htmllint;
