import lazypipe from 'lazypipe';
import loadPlugins from 'gulp-load-plugins';

const $ = loadPlugins();

function tsPipe() {
  const tsProject = $.typescript.createProject('tsconfig.json');
  return lazypipe()
    .pipe(tsProject)

    // Since TypeScript transpiles *.ts into *.js, we need to rename it
    // back to *.ts so that the rejoiner can find it to reinsert into the
    // original HTML file.
    //
    // The temporary filenames from the HTML splitter follow this pattern:
    // <orig_html_file_basename>.html_script_<index>.js
    // e.g., my-view1.html_script_1.js
    .pipe(() => $.if('**/*html_script_*.js', $.extReplace('.ts')));
}

function minifyPipe() {
  return lazypipe()
    .pipe($.debug, {title: 'minify'})
    .pipe($.plumber)
    .pipe($.if, '**/*.css', $.cleanCss())
    .pipe($.if, '**/*.html', $.htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true
    }))
    .pipe($.if, ['**/*.js', '!**/*.min.js'], uglify())
    .pipe($.plumber.stop);
}

function uglify() {
  // FIXME: Using $.uglify.on('error') causes build to hang
  // on error events, and this message appears:
  //   "Did you forget to signal async completion?"
  //
  // This is possibly caused by the use of lazypipe and pump.
  // Ignore for now, since we want the stream to end to allow
  // the user to fix the Uglify errors. Refactor later to use
  // pump for this error handling.
  const task = $.uglify();
  task.on('error', function(err) {
    $.util.log(
      $.util.colors.cyan('[uglify]'),
      `${err.cause.filename}:${err.cause.line}:${err.cause.col}`,
      $.util.colors.red(`${err.cause.message}`)
    );
    this.emit('end');
  });
  return task;
}

module.exports = {
  uglify,
  minifyPipe,
  tsPipe
};
