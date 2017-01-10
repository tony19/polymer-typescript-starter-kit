import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';

const $ = loadPlugins();

function tslint() {
  return pump([
    gulp.src('{src,test}/**/*.ts'),
    $.debug({title: 'tslint'}),
    $.tslint({
      tslint: require('tslint'),
      configuration: '.tslint.json',
      formatter: 'verbose'
    }),
    $.tslint.report(),
  ]);
}
tslint.description = 'Lints TypeScript files';

gulp.task('tslint', tslint);
