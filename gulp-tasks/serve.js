const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const historyApiFallback = require('connect-history-api-fallback');
const browserSync = require('browser-sync');
const dest = require('./dest.js');
const args = require('yargs').argv;
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

  // gulp.watch(['src/**/*.html'], gulp.series('htmllint', reload));
  // gulp.watch(['src/styles/**/*.{scss,css}'], gulp.series('styles', reload));
  // gulp.watch(['src/components/**/*.{scss,css}'], gulp.series('elements', reload));
  $.watch(`src/**/*.{js,ts}`, {verbose: true}, gulp.series('scripts', reload));
  // gulp.watch('src/images/**/*', reload);
}

gulp.task('serve', gulp.series('scripts', serve));
module.exports = serve;
