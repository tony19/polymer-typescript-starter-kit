const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const historyApiFallback = require('connect-history-api-fallback');
const browserSync = require('browser-sync');
const dest = require('../dest');
const args = require('yargs').argv;
require('./htmllint');
require('./scripts');

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
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    https: args.https,
    server: {
      baseDir: [dest.debugDir, '.'],
      middleware: [historyApiFallback()]
    }
  });

  // Wrap this in named function so that Gulp4 displays the name
  const reload = function reload() {
    browserSync.reload();
  };

  $.watch('src/**/*.html', {verbose: true}, gulp.series('htmllint', reload));
  $.watch('src/**/*.{js,ts}', {verbose: true}, gulp.series('scripts', reload));
}

gulp.task('serve', gulp.series('scripts', serve));
module.exports = serve;
