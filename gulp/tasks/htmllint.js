import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';

const $ = loadPlugins();

function htmllint() {
  return gulp.src('src/**/*.html')
    .pipe($.debug({title: 'htmllint'}))
    .pipe($.htmlLint())
    .pipe($.htmlLint.format())
    .pipe($.htmlLint.failOnError());
}

gulp.task('htmllint', htmllint);
