import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';
import {argv as args} from 'yargs';

const $ = loadPlugins();

function licenseTask() {
  const stream = gulp.src([
      'src/**/*.{js,ts,html,css,scss,sass}',
      'LICENSE',
      '*.js',
      'gulp/**/*.js',
      args.include || '',
      args.exclude && `!${args.exclude}` || '',
    ], { base: './'});

  if (args.w) {
    return pump([
      stream,
      $.debug({title: 'license'}),
      $.license('bsd2', {organization: 'Anthony Trinh', year: 2017}),
      gulp.dest('./')
    ]);
  } else {
    return pump([
      stream,
      $.licenseCheck({
        path: 'LICENSE',
        blocking: false,
        logInfo: false,
        logError: true
      })
    ])
  }
}

licenseTask.description = 'Verifies license headers';
licenseTask.flags = {
  '-w': `Update license headers if necessary`,
  '--include': `Glob patterns to include`,
  '--exclude': `Glob patterns to exclude`,
};
gulp.task('license', licenseTask);
