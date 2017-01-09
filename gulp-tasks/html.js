const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const project = require('./project');
const lazypipe = require('lazypipe');
require('./htmllint');

const html = project.merge(source, dependencies);

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

    .pipe($.if('**/*.{js,ts}', $.debug({title: 'html:src'})))
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
    .pipe($.if(['**/*.js', '!**/system*.js'], $.debug({title: 'html:dep'})))
    .pipe($.if(['**/*.js', '!**/system*.js'], $.babel({presets: ['es2015']})))
    .pipe($.if(['**/*.js', '!**/*.min.js'], $.uglify()))
    .pipe(project.rejoin());
}

gulp.task('html', gulp.series('htmllint', html));
module.exports = html;
