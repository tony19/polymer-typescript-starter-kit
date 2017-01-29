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
import * as utils from '../utils';
import {PolymerProjectHelper} from '../project';
const pump = require('pump');
import './htmllint';

const $: any = loadPlugins();

class PolymerProject {
  project: PolymerProjectHelper;

  constructor() {
    this.project = new PolymerProjectHelper();
  }

  build() {
    const mergeTask = this.project.merge(
      this.splitSource.bind(this),
      this.splitDependencies.bind(this)
    );
    return mergeTask.call(this.project).then(() => {
      return this.project.serviceWorker();
    });
  }

  /**
   * Splits all of your source files into one big ReadableStream. Source files
   * are those in src/** as well as anything added to the `sources` property
   * of polymer.json. Because most HTML Imports contain inline CSS and JS,
   * those inline resources will be split out into temporary files. You can use
   * $.if to filter files out of the stream and run them through specific
   * tasks.
   */
  splitSource() {
    return pump([
      this.project.splitSource(),
      $.debug({title: 'html:src'}),

      // Replace <script type="text/x-typescript"> into <script>
      // since the script body gets transpiled into JavaScript
      $.if('**/*.html', $.replace(/(<script.*type=["'].*\/)x-typescript/, '$1javascript')),

      $.if('**/*.css', $.sass().on('error', $.sass.logError)),
      $.if('**/*.ts', utils.tsPipe()()),
      $.if('**/*.js', $.babel()),

      $.if($.util.env.env === 'production', utils.minifyPipe()()),

      this.project.rejoin(),
    ]);
  }

  // TODO: Move dependencies to different task
  /**
   * Splits all of your dependency files into one big ReadableStream.
   * These are determined from walking your source files and from the
   * `extraDependencies` property of polymer.json.
   */
  splitDependencies() {
    return pump([
      this.project.splitDependencies(),
      $.debug({title: 'html:dep'}),
      $.if(['**/*.js', '!**/*.min.js', '!**/dist/system*.js'], $.babel()),
      $.if($.util.env.env === 'production', utils.minifyPipe()()),
      this.project.rejoin(),
    ]);
  }

  serviceWorker() {
    return this.project.serviceWorker();
  }
}

const htmlTask = function html() {
  const polymerProject = new PolymerProject();
  return polymerProject.build();
};

(<any>htmlTask).description = 'Builds HTML files (and dependencies)';
gulp.task('html', ['htmllint'], htmlTask);
