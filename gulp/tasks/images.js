import * as config from '../config';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';

const $ = loadPlugins();

const imagesTask = function images() {
  const build = {
    bundledDir: config.getBundledDir(),
    unbundledDir: config.getUnbundledDir(),
    debugDir: config.getDebugDir(),
  };

  const stream = pump([
    gulp.src('images/**/*.{png,gif,jpg,svg}'),
    $.debug({title: 'images'}),
    $.imagemin(),
  ]);

  if (build.bundledDir) {
    stream.pipe(gulp.dest(build.bundledDir));
  }
  if (build.unbundledDir) {
    stream.pipe(gulp.dest(build.unbundledDir));
  }

  return stream;
};

imagesTask.description = 'Optimizes images';
gulp.task('images', imagesTask);
