import * as config from '../config';
import {argv as args} from 'yargs';
import browserSync from 'browser-sync';
import gulp from 'gulp';
import historyApiFallback from 'connect-history-api-fallback';
import loadPlugins from 'gulp-load-plugins';
import './html';
import './htmllint';
import './scripts';

const $ = loadPlugins();

function serve() {
  const port = args.port || 8000;

  browserSync({
    port: port,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    https: args.https,
    server: {
      baseDir: [config.getDebugDir(), config.getUnbundledDir(), '.'],
      middleware: [historyApiFallback()]
    }
  });

  // Wrap this in named function so that Gulp4 displays the name
  const reload = function reload() {
    browserSync.reload();
  };

  $.watch('src/**/*.html', {verbose: true}, gulp.series('html', reload));
  $.watch('src/**/*.{js,ts}', {verbose: true}, gulp.series('scripts', reload));
}

gulp.task('serve', gulp.series(gulp.parallel('scripts', 'html'), serve));
