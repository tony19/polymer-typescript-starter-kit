/*!
 * Copyright (c) 2017, Anthony Trinh
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as config from '../config';
import * as path from 'path';
import * as utils from '../utils';
import {argv as args} from 'yargs';
import {HtmlSplitter} from '../project';
import * as browserSync from 'browser-sync';
import * as gulp from 'gulp';
const historyApiFallback = require('connect-history-api-fallback');
import * as loadPlugins from 'gulp-load-plugins';
const pump = require('pump');
import './html';
import './htmllint';
import './scripts';

const $: any = loadPlugins();
const DEFAULT_PORT = 8000;

function serve() {
  const port = args.port || DEFAULT_PORT;

  const options: browserSync.Options = {
    logPrefix: 'PSK',
    minify: false,
    notify: true,
    port: port,
    snippetOptions: {
      rule: {
        match: /<\/body>/,
        fn: (snippet, match) => snippet + match
      }
    },
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    https: args.https,
    server: {
      baseDir: [(<any>config).getDebugDir(), (<any>config).getUnbundledDir(), '.'],
      middleware: [historyApiFallback()]
    }
  };
  if (args.https) {
    (<any>options).httpModule = 'http2';
  }
  browserSync(options);

  gulp.watch('src/**/*.html', () => {/*ignore*/}).on('change', (event: any) => {
    if (event.type === 'changed') {
      const filename = event.path.replace(process.cwd() + path.sep, '');
      const stream = singleHtml(filename);
      stream.on('finish', () => browserSync.reload());
      return stream;
    }
  });
  gulp.watch('src/**/*.{js,ts}', ['scripts', () => browserSync.reload()]);
  gulp.watch('src/**/*.{css,sass,scss}', ['styles', () => browserSync.reload()]);
}
(<any>serve).description = 'Starts development server';
(<any>serve).flags = {
  '--port': `starting port number (default: ${DEFAULT_PORT})`
};

gulp.task('serve', serve);


function singleHtml(filename: string) {
  const splitter = new HtmlSplitter();
  return pump([
    splitter.split(filename),
    $.debug({title: 'html:reload'}),

    // Replace <script type="text/x-typescript"> into <script>
    // since the script body gets transpiled into JavaScript
    $.if('**/*.html', $.replace(/(<script.*type=["'].*\/)x-typescript/, '$1javascript')),

    $.if('**/*.css', $.sass().on('error', $.sass.logError)),
    $.if('**/*.html', $.htmllint()),
    $.if('**/*.ts', utils.tsPipe()()),
    $.if('**/*.js', $.babel()),
    $.if($.util.env.env === 'production', utils.minifyPipe()()),

    splitter.rejoin((<any>config).getDebugDir()),
  ]);
}
