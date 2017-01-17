import * as config from '../config';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';

const $ = loadPlugins();

function stylesTask() {
  const build = {
    bundledDir: config.getBundledDir(),
    unbundledDir: config.getUnbundledDir(),
    debugDir: config.getDebugDir(),
  };

  const stream = pump([
    gulp.src('{src,test}/**/*.{css,sass,scss}'),
    $.debug({title: 'styles'}),
    $.sass().on('error', $.sass.logError),
    gulp.dest(build.debugDir),
  ]);

  if (build.bundledDir) {
    stream.pipe(gulp.dest(build.bundledDir));
  }
  if (build.unbundledDir) {
    stream.pipe(gulp.dest(build.unbundledDir));
  }

  return stream;
}

stylesTask.description = 'Builds the CSS';
gulp.task('styles', ['csslint'], stylesTask);
