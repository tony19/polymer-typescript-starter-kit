import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';

const $ = loadPlugins();

function tslint() {
  return gulp.src('{src,test}/**/*.ts')
    .pipe($.debug({title: 'tslint'}))
    .pipe($.tslint({
      tslint: require('tslint'),
      configuration: '.tslint.json',
      formatter: 'verbose'
    }))
    .pipe($.tslint.report());
}

gulp.task('tslint', tslint);
