const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const path = require('path');
const dest = require('../dest');
require('./tslint');

function scripts() {
  const tsProject = $.typescript.createProject('tsconfig.json', {
    typescript: require('typescript')
  });
  const tsResult = gulp.src('{src,test}/**/*.ts')
                     .pipe($.debug({title: 'scripts'}))
                     .pipe($.sourcemaps.init())
                     .pipe(tsProject());

  return tsResult.js
    .pipe($.sourcemaps.write({
      includeContent: false,

      // Return relative source map root directories per file.
      sourceRoot: file => {
        const sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }))
    .pipe(gulp.dest(dest.debugDir))
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    .pipe($.if(!!dest.unbundledDir, gulp.dest(dest.unbundledDir)))
    .pipe($.if(!!dest.bundledDir, gulp.dest(dest.bundledDir)));
}

gulp.task('scripts', gulp.series('tslint', scripts));
module.exports = scripts;
