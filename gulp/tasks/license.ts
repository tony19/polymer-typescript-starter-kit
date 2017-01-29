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
import * as gulp from 'gulp';
import * as loadPlugins from 'gulp-load-plugins';
const pump = require('pump');
import {argv as args} from 'yargs';

const $: any = loadPlugins();

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

(<any>licenseTask).description = 'Verifies license headers';
(<any>licenseTask).flags = {
  '-w': `Update license headers if necessary`,
  '--include': `Glob patterns to include`,
  '--exclude': `Glob patterns to exclude`,
};
gulp.task('license', licenseTask);
