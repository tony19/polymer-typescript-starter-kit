import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';

const $ = loadPlugins();

function htmllintReporter(filepath, issues) {
  if (issues.length > 0) {
    for (const issue of issues) {
      $.util.log(
        $.util.colors.cyan('[gulp-htmllint] ') +
        $.util.colors.white(`${filepath} [${issue.line},${issue.column}]: `) +
        $.util.colors.red(`(${issue.code}) ${issue.msg}`)
      );
    }

    process.exitCode = 1;
  }
}

function htmllint() {
  return pump([
    gulp.src('src/**/*.html'),
    $.htmllint({}, htmllintReporter),
  ]);
}

htmllint.description = 'Lints HTML files';
gulp.task('htmllint', htmllint);
