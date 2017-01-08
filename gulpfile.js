/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const lazypipe = require('lazypipe');

// Got problems? Try logging 'em
// const logging = require('plylog');
// logging.setVerbose();

// !!! IMPORTANT !!! //
// Keep the global.config above any of the gulp-tasks that depend on it
global.config = {
  polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
  build: {
    rootDirectory: 'build',
    bundledDirectory: 'bundled',
    unbundledDirectory: 'unbundled',
    debugDirectory: 'debug',
    // Accepts either 'bundled', 'unbundled', or 'both'
    // A bundled version will be vulcanized and sharded. An unbundled version
    // will not have its files combined (this is for projects using HTTP/2
    // server push). Using the 'both' option will create two output projects,
    // one for bundled and one for unbundled
    bundleType: 'both'
  },
  // Path to your service worker, relative to the build root directory
  serviceWorkerPath: 'service-worker.js',
  // Service Worker precache options based on
  // https://github.com/GoogleChrome/sw-precache#options-parameter
  swPrecacheConfig: {
    navigateFallback: '/index.html'
  }
};

// Add your own custom gulp tasks to the gulp-tasks directory
// A few sample tasks are provided for you
// A task should return either a WriteableStream or a Promise
const clean = require('./gulp-tasks/clean.js');
const project = require('./gulp-tasks/project.js');

// The source task will split all of your source files into one
// big ReadableStream. Source files are those in src/** as well as anything
// added to the sourceGlobs property of polymer.json.
// Because most HTML Imports contain inline CSS and JS, those inline resources
// will be split out into temporary files. You can use $.if to filter files
// out of the stream and run them through specific tasks.
function source() {
  const tsProject = $.typescript.createProject('tsconfig.json');
  const tsPipe = lazypipe()
    .pipe(tsProject)
    .pipe($.uglify)
    .pipe(() => $.if((file) => {
        // Since TypeScript transpiles *.ts into *.js, we need to rename it
        // back to *.ts so that the rejoiner can find it to reinsert into the
        // original HTML file.
        //
        // The temporary filenames from the HTML splitter follow this pattern:
        // <orig_html_file_basename>.html_script_<index>.js
        // e.g., my-view1.html_script_1.js
        return /\.html_script/i.test(file.basename);
      },
      $.extReplace('.ts')));

  return project.splitSource()
    .pipe($.if('**/*.css', $.cleanCss()))
    .pipe($.if('**/*.html', $.htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true
    })))

    // Replace <script type="text/x-typescript"> into <script>
    // since the script body gets transpiled into JavaScript
    .pipe($.if('**/*.html', $.replace(/(<script.*type=["'].*\/)x-typescript/, '$1javascript')))

    .pipe($.if('**/*.{js,ts}', $.print((filepath) => `src: ${filepath}`)))
    .pipe($.if('**/*.ts', tsPipe()))
    .pipe($.if('**/*.js', $.babel({presets: ['es2015']})))
    .pipe($.if(['**/*.js', '!**/*.min.js'], $.uglify()))
    .pipe(project.rejoin());
}

// The dependencies task will split all of your bower_components files into one
// big ReadableStream
// You probably don't need to do anything to your dependencies but it's here in
// case you need it :)
function dependencies() {
  return project.splitDependencies()
    .pipe($.if('**/*.css', $.cleanCss()))
    .pipe($.if('**/*.html', $.htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true
    })))
    .pipe($.if(['**/*.js', '!**/system*.js'], $.print((filepath) => `dep: ${filepath}`)))
    .pipe($.if(['**/*.js', '!**/system*.js'], $.babel({presets: ['es2015']})))
    .pipe($.if(['**/*.js', '!**/*.min.js'], $.uglify()))
    .pipe(project.rejoin());
}

gulp.task('clean', clean);
gulp.task('build', gulp.series('clean', project.merge(source, dependencies)));
gulp.task('sw', project.serviceWorker);

// Clean the build directory, split all source and dependency files into streams
// and process them, and output bundled and unbundled versions of the project
// with their own service workers
gulp.task('default', gulp.series('build', 'sw'));

// Load custom Gulp tasks
const fs = require('fs');
fs.readdirSync('gulp-tasks').forEach(file => {
  if (file.endsWith('.js')) {
    require(`./gulp-tasks/${file}`);
  }
});
