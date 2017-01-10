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
const DEFAULT_PORT = 8000;

function serve() {
  const port = args.port || DEFAULT_PORT;

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
serve.description = 'Starts development server';
serve.flags = {
  '--port': `starting port number (default: ${DEFAULT_PORT})`
};

gulp.task('serve', serve);
