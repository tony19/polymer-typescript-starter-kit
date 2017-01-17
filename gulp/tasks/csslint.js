import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';

const $ = loadPlugins();

function csslintTask() {
  return pump([
    gulp.src('{src,test}/**/*.{css,sass,scss}'),
    $.debug({title: 'csslint'}),
    $.sassLint(),
    $.sassLint.format(),
    $.sassLint.failOnError(),
  ]);
}

csslintTask.description = 'Lints the CSS/SCSS files';
gulp.task('csslint', csslintTask);
