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
import * as polymerBuild from 'polymer-build';
import * as loadPlugins from 'gulp-load-plugins';
import * as pipes from './pipes';
import {HtmlSplitter} from "./html-splitter";

const $: any = loadPlugins();
const config = require('./config.json');
const mergeStream = require('merge-stream');
const pump = require('pump');

export interface BuildOptions {
  bundle: boolean,
  buildServiceWorker: boolean,
  buildDependencies: boolean
}

export class PolymerProject {

  private _project: polymerBuild.PolymerProject;

  constructor(polymerJsonPath: string) {
    this._project = new polymerBuild.PolymerProject(polymerJsonPath);
  }

  static buildHtmlFile(filename: string) {
    const splitter = new HtmlSplitter();
    return pump([
      splitter.split(filename),
      $.debug({title: 'html'}),
      $.if('**/*.html', $.htmllint()),
      ...pipes.htmlPipe,
      ...($.util.env.env === 'production' ? pipes.minifyPipe : []),
      splitter.rejoin(config.build.debugDir),
    ]);
  }

  /**
   * Builds all HTML files in the project, and generates
   * a service worker
   */
  async build(options: BuildOptions) {
    const stream = mergeStream(
      this.buildSource(),
      options.buildDependencies
        ? this.buildDependencies()
        : this._project.dependencies()
    );

    await this._writeOutput(stream, options.bundle);

    if (options.buildServiceWorker) {
      await this._writeServiceWorker(options.bundle);
    }
  }

  /**
   * Builds the HTML files from sources, specified in `sources`
   * from polymer.json
   */
  buildSource() {
    return pump([
      this._splitSource(),
      $.debug({title: 'html:src'}),
      ...pipes.htmlPipe,
      ...($.util.env.env === 'production' ? pipes.minifyPipe : []),
      this._project.rejoinHtml(),
    ]);
  }

  /**
   * Builds the HTML files from dependencies, specified in
   * `extraDependencies` from polymer.json and from HTML imports
   */
  buildDependencies() {
    return pump([
      this._splitDependencies(),
      $.debug({title: 'html:dep'}),
      $.if(['**/*.js', '!**/*.min.js', '!**/dist/system*.js'], $.babel()),
      ...($.util.env.env === 'production' ? pipes.minifyPipe : []),
      this._project.rejoinHtml(),
    ]);
  }

  private _splitSource(): NodeJS.ReadWriteStream {
    return this._project.sources().pipe(this._project.splitHtml());
  }

  private _splitDependencies(): NodeJS.ReadWriteStream {
    return this._project.dependencies().pipe(this._project.splitHtml());
  }

  private _writeOutput(stream: any, bundle: boolean) {
    return new Promise(resolve => {
      let strm = stream;
      if (bundle) {
        strm = stream.pipe(this._project.bundler)
      }
      strm.pipe(gulp.dest(config.build.unbundledDir))
        .on('end', resolve);
    });
  }

  private _writeServiceWorker(bundle: boolean) {
    return polymerBuild.addServiceWorker({
      project: this._project,
      buildRoot: config.build.unbundledDir,
      swPrecacheConfig: config.swPrecacheConfig,
      path: config.serviceWorkerPath,
      bundled: bundle
    });
  }
}
