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
/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
import * as config from './config';
import * as gulp from 'gulp';
import * as path from 'path';
import * as polymer from 'polymer-build';
const mergeStream = require('merge-stream');

export class HtmlSplitter {
  root?: string;
  filename: string;
  project: polymer.PolymerProject;

  constructor(root?: string) {
    if (!root) {
      const {projectRoot} = require((<any>config).polymerJsonPath);
      root = projectRoot || '.';
    }
    this.root = root;
  }

  /**
   * Splits an HTML file into CSS, JS, and HTML streams
   * @param filename path to HTML file
   * @returns stream
   */
  split(filename: string): NodeJS.ReadWriteStream {
    const projectConfig = {
      root: this.root,
      sources: [filename],
    };
    this.filename = filename;
    this.project = new polymer.PolymerProject(projectConfig);
    return gulp.src(filename).pipe(this.project.splitHtml());
  }

  /**
   * Rejoins split streams into HTML file
   * @param dest path to destination directory
   * @returns stream
   */
  rejoin(dest: string): NodeJS.ReadWriteStream {
    const stream = this.project.rejoinHtml();
    // FIXME: polymer-build's bundler is broken
    // https://github.com/Polymer/polymer-build/issues/110
    // stream.pipe(this.project.bundler);
    stream.pipe(gulp.dest(path.join(dest, this.filename, '..')));
    return stream;
  }
}

/**
 * This is the heart of polymer-build and exposes much of the
 * work that Polymer CLI usually does for you. There are tasks
 * to split the source files and dependency files into streams,
 * and tasks to rejoin them and output service workers
 */
export class PolymerProjectHelper {
  project: polymer.PolymerProject;

  constructor() {
    const polymerJson = require((<any>config).polymerJsonPath);
    this.project = new polymer.PolymerProject(polymerJson);
  }

  /**
   * Returns a ReadableStream of all the source files.
   * Source files are those in src/** as well as anything
   * added to the sourceGlobs property of polymer.json.
   * @returns {Transform}
   */
  splitSource(): NodeJS.ReadWriteStream {
    return this.project.sources().pipe(this.project.splitHtml());
  }

  /**
   * Returns a ReadableStream of all the dependency files.
   * Dependency files are those in bower_components.
   * @returns {Transform}
   */
  splitDependencies(): NodeJS.ReadWriteStream {
    return this.project.dependencies().pipe(this.project.splitHtml());
  }

  /**
   * Returns a WriteableStream to rejoin all split files
   * @returns {Transform}
   */
  rejoin(): NodeJS.ReadWriteStream {
    return this.project.rejoinHtml();
  }

  /**
   * Returns a function which accepts references to functions that generate
   * ReadableStreams. These ReadableStreams will then be merged, and used to
   * generate the bundled and unbundled versions of the site.
   * Takes an argument for the user to specify the kind of output they want
   * either bundled or unbundled. If this argument is omitted it will output both
   * @param source
   * @param dependencies
   * @returns Promise
   */
  merge(source: Function, dependencies: Function) {
    return () => {
      const mergedFiles = mergeStream(source(), dependencies());
      const bundleType = (<any>config).build.bundleType;
      let outputs = [];

      if (bundleType === 'both' || bundleType === 'bundled') {
        outputs.push(this.writeBundledOutput(polymer.forkStream(mergedFiles)));
      }
      if (bundleType === 'both' || bundleType === 'unbundled') {
        outputs.push(this.writeUnbundledOutput(polymer.forkStream(mergedFiles)));
      }

      return Promise.all(outputs);
    };
  }

  /**
   * Run the files through a bundling step which will vulcanize/shard them
   * then output to the dest dir
   * @param stream
   * @returns Promise
   */
  writeBundledOutput(stream: any) {
    return new Promise(resolve => {
      stream.pipe(this.project.bundler)
        .pipe(gulp.dest((<any>config).getBundledDir()))
        .on('end', resolve);
    });
  }

  /**
   * Just output files to the dest dir without bundling. This is for projects that
   * use HTTP/2 server push
   * @param stream
   * @returns Promise
   */
  writeUnbundledOutput(stream: any) {
    return new Promise(resolve => {
      stream.pipe(gulp.dest((<any>config).getUnbundledDir()))
        .on('end', resolve);
    });
  }

  /**
   * Returns a function which takes an argument for the user to specify the kind
   * of bundle they're outputting (either bundled or unbundled) and generates a
   * service worker for that bundle.
   * If this argument is omitted it will create service workers for both bundled
   * and unbundled output
   * @returns Promise
   */
  serviceWorker() {
    const bundleType = (<any>config).build.bundleType;
    let workers = [];

    if (bundleType === 'both' || bundleType === 'bundled') {
      workers.push(this.writeBundledServiceWorker());
    }
    if (bundleType === 'both' || bundleType === 'unbundled') {
      workers.push(this.writeUnbundledServiceWorker());
    }

    return Promise.all(workers);
  }

  /**
   * Returns a Promise to generate a service worker for bundled output
   */
  writeBundledServiceWorker() {
    return polymer.addServiceWorker({
      project: this.project,
      buildRoot: (<any>config).getBundledDir(),
      swPrecacheConfig: (<any>config).swPrecacheConfig,
      path: (<any>config).serviceWorkerPath,
      bundled: true
    });
  }

  /**
   * Returns a Promise to generate a service worker for unbundled output
   */
  writeUnbundledServiceWorker() {
    return polymer.addServiceWorker({
      project: this.project,
      buildRoot: (<any>config).getUnbundledDir(),
      swPrecacheConfig: (<any>config).swPrecacheConfig,
      path: (<any>config).serviceWorkerPath
    });
  }

}
