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
import * as chalk from 'chalk';
import * as loadPlugins from 'gulp-load-plugins';
import * as through2 from 'through2';
import {Transform} from 'stream';
const dartSass = require('dart-sass');
const lazypipe = require('lazypipe');

const $: any = loadPlugins();

export function tsLazyPipe() {
  const tsProject = $.typescript.createProject('tsconfig.json');
  return lazypipe()
    .pipe(tsProject)

    // Since TypeScript transpiles *.ts into *.js, we need to rename it
    // back to *.ts so that the rejoiner can find it to reinsert into the
    // original HTML file.
    //
    // The temporary filenames from the HTML splitter follow this pattern:
    // <orig_html_file_basename>.html_script_<index>.js
    // e.g., my-view1.html_script_1.js
    .pipe(() => $.if('**/*html_script_*.js', $.extReplace('.ts')));
}

export function uglifyPipe() {
  // FIXME: Using $.uglify.on('error') causes build to hang
  // on error events, and this message appears:
  //   "Did you forget to signal async completion?"
  //
  // This is possibly caused by the use of lazypipe and pump.
  // Ignore for now, since we want the stream to end to allow
  // the user to fix the Uglify errors. Refactor later to use
  // pump for this error handling.
  const task = $.uglify();
  task.on('error', (err: any) => {
    $.util.log(
      $.util.colors.cyan('[uglify]'),
      `${err.cause.filename}:${err.cause.line}:${err.cause.col}`,
      $.util.colors.red(`${err.cause.message}`)
    );
    task.emit('end');
  });
  return task;
}

export const dartSassPipe = (): Transform => through2.obj((file, _enc, cb) => {
  dartSass.render({file: file.path}, (err: Error, result: Buffer) => {
    if (!err) {
      file.contents = result.buffer;
    } else {
      console.error(chalk.red('[dart-sass] ') + err.message);
    }
    cb(err, file);
  });
});

/* The following pipes are arrays because they're passed to pump. */

export const htmlPipe = () => [
  // Replace <script type="text/x-typescript"> into <script>
  // since the script body gets transpiled into JavaScript
  $.if('**/*.html', $.replace(/(<script.*type=["'].*\/)x-typescript/, '$1javascript')),

  // TODO: dart-sass doesn't accept buffers/strings, so for now,
  // we can't transpile inline Sass. We could write the string
  // into a temporary file and pass that to dart-sass. For now,
  // just lint.
  $.if('**/*.css', $.stylelint({
    configOverrides: {
      rules: {
        indentation: null,
      }
    },
    reporters: [
      {formatter: 'string', console: true}
    ]
  })),
  $.if('**/*.ts', tsLazyPipe()()),
  $.if('**/*.js', $.babel()),
];

export const minifyPipe = () => [
  $.debug({title: 'minify'}),
  $.plumber(),
  $.if('**/*.css', $.cleanCss()),
  $.if('**/*.html', $.htmlmin({
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true
  })),
  $.if(['**/*.js', '!**/*.min.js'], uglifyPipe()),
  $.plumber.stop(),
];
