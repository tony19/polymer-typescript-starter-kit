import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';

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
  return gulp.src('src/**/*.html')
    .pipe($.htmllint({}, htmllintReporter));
}

htmllint.description = 'Lints HTML files';
gulp.task('htmllint', htmllint);
