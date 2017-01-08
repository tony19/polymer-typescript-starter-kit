const $ = require('gulp-load-plugins')();
const gulp = require('gulp');

function tslint() {
  return gulp.src('{src,test}/**/*.ts')
    .pipe($.tslint({
      tslint: require('tslint'),
      configuration: '.tslint.json',
      formatter: 'verbose'
    }))
    .pipe($.tslint.report());
}

gulp.task('tslint', tslint);
module.exports = tslint;
