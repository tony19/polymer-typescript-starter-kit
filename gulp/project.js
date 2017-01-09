/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
import gulp from 'gulp';
import mergeStream from 'merge-stream';
import * as polymer from 'polymer-build';
import dest from './dest';

/**
 * This is the heart of polymer-build and exposes much of the
 * work that Polymer CLI usually does for you. There are tasks
 * to split the source files and dependency files into streams,
 * and tasks to rejoin them and output service workers
 */
export class PolymerProjectHelper {

  constructor() {
    const polymerJSON = require(global.config.polymerJsonPath);
    this.project = new polymer.PolymerProject(polymerJSON);
  }

  /**
   * Returns a ReadableStream of all the source files.
   * Source files are those in src/** as well as anything
   * added to the sourceGlobs property of polymer.json.
   * @returns {Transform}
   */
  splitSource() {
    return this.project.sources().pipe(this.project.splitHtml());
  }

  /**
   * Returns a ReadableStream of all the dependency files.
   * Dependency files are those in bower_components.
   * @returns {Transform}
   */
  splitDependencies() {
    return this.project.dependencies().pipe(this.project.splitHtml());
  }

  /**
   * Returns a WriteableStream to rejoin all split files
   * @returns {Transform}
   */
  rejoin() {
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
  merge(source, dependencies) {
    return function output() {
      const mergedFiles = mergeStream(source(), dependencies());
      const bundleType = global.config.build.bundleType;
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
  writeBundledOutput(stream) {
    return new Promise(resolve => {
      stream.pipe(this.project.bundler)
        .pipe(gulp.dest(dest.bundledDir))
        .on('end', resolve);
    });
  }

  /**
   * Just output files to the dest dir without bundling. This is for projects that
   * use HTTP/2 server push
   * @param stream
   * @returns Promise
   */
  writeUnbundledOutput(stream) {
    return new Promise(resolve => {
      stream.pipe(gulp.dest(dest.unbundledDir))
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
    const bundleType = global.config.build.bundleType;
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
      buildRoot: dest.bundledDir,
      swPrecacheConfig: global.config.swPrecacheConfig,
      path: global.config.serviceWorkerPath,
      bundled: true
    });
  }

  /**
   * Returns a Promise to generate a service worker for unbundled output
   */
  writeUnbundledServiceWorker() {
    return polymer.addServiceWorker({
      project: this.project,
      buildRoot: dest.unbundledDir,
      swPrecacheConfig: global.config.swPrecacheConfig,
      path: global.config.serviceWorkerPath
    });
  }

}
