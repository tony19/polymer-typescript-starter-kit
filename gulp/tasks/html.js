import {PolymerProjectHelper} from '../project';
import gulp from 'gulp';
import lazypipe from 'lazypipe';
import loadPlugins from 'gulp-load-plugins';
import './htmllint';

const $ = loadPlugins();

class PolymerProject {
  constructor() {
    this.project = new PolymerProjectHelper();
  }

  build() {
    const mergeTask = this.project.merge(
      this.splitSource.bind(this),
      this.splitDependencies.bind(this)
    );
    return mergeTask.call(this.project);
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

    return this.project.splitSource()
      .pipe($.debug({title: 'html:src'}))
      .pipe($.if('**/*.css', $.cleanCss()))
      .pipe($.if('**/*.html', $.htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true
      })))

      // Replace <script type="text/x-typescript"> into <script>
      // since the script body gets transpiled into JavaScript
      .pipe($.if('**/*.html', $.replace(/(<script.*type=["'].*\/)x-typescript/, '$1javascript')))

      .pipe($.if('**/*.ts', tsPipe()))
      .pipe($.if('**/*.js', $.babel({presets: ['es2015']})))
      .pipe($.if(['**/*.js', '!**/*.min.js'], $.uglify()))
      .pipe(this.project.rejoin());
  }

  // TODO: Move dependencies to different task
  /**
   * Splits all of your dependency files into one big ReadableStream.
   * These are determined from walking your source files and from the
   * `extraDependencies` property of polymer.json.
   */
  splitDependencies() {
    return this.project.splitDependencies()
      .pipe($.debug({title: 'html:dep'}))
      .pipe($.if('**/*.css', $.cleanCss()))
      .pipe($.if('**/*.html', $.htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true
      })))
      .pipe($.if(['**/*.js', '!**/dist/system*.js'], $.babel({presets: ['es2015']})))
      .pipe($.if(['**/*.js', '!**/*.min.js'], $.uglify()))
      .pipe(this.project.rejoin());
  }

  serviceWorker() {
    return this.project.serviceWorker();
  }
}

let polymerProject;
const htmlTask = gulp.series('htmllint', function html() {
  polymerProject = new PolymerProject();
  return polymerProject.build();
});

htmlTask.description = 'Builds HTML files (and dependencies)';
gulp.task('html', htmlTask);

// FIXME: Move this to sw.js once we determine how to cleanly get a
// reference to the current polymerProject.
const swTask = gulp.series('html', function sw() {
  return polymerProject.serviceWorker();
});

swTask.description = 'Generates service worker';
gulp.task('sw', swTask);
