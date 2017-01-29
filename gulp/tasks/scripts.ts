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
import * as gulp from 'gulp';
import * as loadPlugins from 'gulp-load-plugins';
const pump = require('pump');

import './tslint';

const $: any = loadPlugins();

const scriptsTask = function scripts() {
  const tsProject = $.typescript.createProject('tsconfig.json', {
    // tsconfig.json is currently using module:commonjs because
    // `nyc` fails without it. We override that here as our normal
    // build uses SystemJS.
    module: 'system',
    typescript: require('typescript')
  });
  const tsResult = pump([
    gulp.src('{src,test}/**/*.ts'),
    $.debug({title: 'scripts'}),
    $.sourcemaps.init(),
    tsProject(),
  ]);

  const build = {
    bundledDir: (<any>config).getBundledDir(),
    unbundledDir: (<any>config).getUnbundledDir(),
    debugDir: (<any>config).getDebugDir(),
  };

  tsResult.dts.pipe(gulp.dest(build.debugDir));

  const stream = pump([
    tsResult.js,
    $.sourcemaps.write({
      includeContent: false,

      // Return relative source map root directories per file.
      sourceRoot: (file: any) => {
        const sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }),
    gulp.dest(build.debugDir),
    $.if('*.js', $.uglify({
      preserveComments: 'some'
    })),
  ]);

  if (build.bundledDir) {
    stream.pipe(gulp.dest(build.bundledDir));
  }
  if (build.unbundledDir) {
    stream.pipe(gulp.dest(build.unbundledDir));
  }

  return stream;
};

(<any>scriptsTask).description = 'Builds all TypeScript files';
gulp.task('scripts', ['tslint'], scriptsTask);
