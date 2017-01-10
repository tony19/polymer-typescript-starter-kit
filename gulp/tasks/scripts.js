import * as config from '../config';
import * as path from 'path';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import './tslint';

const $ = loadPlugins();

const scriptsTask = gulp.series('tslint', function scripts() {
  const tsProject = $.typescript.createProject('tsconfig.json', {
    typescript: require('typescript')
  });
  const tsResult = gulp.src('{src,test}/**/*.ts')
                     .pipe($.debug({title: 'scripts'}))
                     .pipe($.sourcemaps.init())
                     .pipe(tsProject());

  const build = {
    bundledDir: config.getBundledDir(),
    unbundledDir: config.getUnbundledDir(),
    debugDir: config.getDebugDir(),
  };

  return tsResult.js
    .pipe($.sourcemaps.write({
      includeContent: false,

      // Return relative source map root directories per file.
      sourceRoot: file => {
        const sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }))
    .pipe(gulp.dest(build.debugDir))
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    .pipe($.if(!!build.unbundledDir, gulp.dest(build.unbundledDir)))
    .pipe($.if(!!build.bundledDir, gulp.dest(build.bundledDir)));
});

scriptsTask.description = 'Builds all TypeScript files';
gulp.task('scripts', scriptsTask);
