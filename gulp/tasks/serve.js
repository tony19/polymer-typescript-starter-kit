import {HtmlSplitter} from '../project';
import * as config from '../config';
import * as path from 'path';
import * as utils from '../utils';
import {argv as args} from 'yargs';
import browserSync from 'browser-sync';
import gulp from 'gulp';
import historyApiFallback from 'connect-history-api-fallback';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';
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
        fn: snippet => snippet
      }
    },
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: args.https,
    server: {
      baseDir: [config.getDebugDir(), config.getUnbundledDir(), '.'],
      middleware: [historyApiFallback()]
    }
  });

  // Wrap this in named function so that Gulp4 displays the name
  const reload = function reload() {
    browserSync.reload();
  };

  function processFile(event) {
    console.log('watch', event);
    if (event.type === 'changed') {
      const filename = event.path.replace(process.cwd() + path.sep, '');
      const stream = singleHtml(filename);
      stream.on('finish', reload);
      return stream;
    }
  }

  // gulp.watch('src/**/*.html').on('change', gulp.series('html', reload));
  gulp.watch('src/**/*.html').on('change', processFile);
  // gulp.watch('src/**/*.{js,ts}').on('change', gulp.series('scripts', reload));
}
serve.description = 'Starts development server';
serve.flags = {
  '--port': `starting port number (default: ${DEFAULT_PORT})`
};

gulp.task('serve', serve);


function singleHtml(filename) {
  const splitter = new HtmlSplitter();
  return pump([
    splitter.split(filename),
    $.debug({title: 'html:reload'}),

    // Replace <script type="text/x-typescript"> into <script>
    // since the script body gets transpiled into JavaScript
    $.if('**/*.html', $.replace(/(<script.*type=["'].*\/)x-typescript/, '$1javascript')),

    // $.plumber(),
    // $.if('**/*.html', $.htmllint()),
    // $.plumber.stop(),
    $.if('**/*.ts', utils.tsPipe()()),
    $.if('**/*.js', $.babel()),
    $.if($.util.env.env === 'production', utils.minifyPipe()()),

    splitter.rejoin(config.getDebugDir()),
  ]);
}
