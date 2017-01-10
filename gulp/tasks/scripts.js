import * as config from '../config';
import * as path from 'path';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';
import './tslint';

const $ = loadPlugins();

const scriptsTask = gulp.series('tslint', function scripts() {
  const tsProject = $.typescript.createProject('tsconfig.json', {
    typescript: require('typescript')
  });
  const tsResult = pump([
    gulp.src('{src,test}/**/*.ts'),
    $.debug({title: 'scripts'}),
    $.sourcemaps.init(),
    tsProject(),
  ]);

  const build = {
    bundledDir: config.getBundledDir(),
    unbundledDir: config.getUnbundledDir(),
    debugDir: config.getDebugDir(),
  };

  return pump([
    tsResult.js,
    $.sourcemaps.write({
      includeContent: false,

      // Return relative source map root directories per file.
      sourceRoot: file => {
        const sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }),
    gulp.dest(build.debugDir),
    $.if('*.js', $.uglify({
      preserveComments: 'some'
    })),
    $.if(!!build.unbundledDir, gulp.dest(build.unbundledDir)),
    $.if(!!build.bundledDir, gulp.dest(build.bundledDir)),
  ]);
});

scriptsTask.description = 'Builds all TypeScript files';
gulp.task('scripts', scriptsTask);
