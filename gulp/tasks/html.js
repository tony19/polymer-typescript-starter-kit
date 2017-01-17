import * as utils from '../utils';
import {PolymerProjectHelper} from '../project';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import pump from 'pump';
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
    return mergeTask.call(this.project).then(() => {
      return this.project.serviceWorker();
    });
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
    return pump([
      this.project.splitSource(),
      $.debug({title: 'html:src'}),

      // Replace <script type="text/x-typescript"> into <script>
      // since the script body gets transpiled into JavaScript
      $.if('**/*.html', $.replace(/(<script.*type=["'].*\/)x-typescript/, '$1javascript')),

      $.if('**/*.ts', utils.tsPipe()()),
      $.if('**/*.js', $.babel()),

      $.if($.util.env.env === 'production', utils.minifyPipe()()),

      this.project.rejoin(),
    ]);
  }

  // TODO: Move dependencies to different task
  /**
   * Splits all of your dependency files into one big ReadableStream.
   * These are determined from walking your source files and from the
   * `extraDependencies` property of polymer.json.
   */
  splitDependencies() {
    return pump([
      this.project.splitDependencies(),
      $.debug({title: 'html:dep'}),
      $.if(['**/*.js', '!**/dist/system*.js'], $.babel()),
      $.if($.util.env.env === 'production', utils.minifyPipe()()),
      this.project.rejoin(),
    ]);
  }

  serviceWorker() {
    return this.project.serviceWorker();
  }
}

const htmlTask = function html() {
  const polymerProject = new PolymerProject();
  return polymerProject.build();
};

htmlTask.description = 'Builds HTML files (and dependencies)';
gulp.task('html', ['htmllint'], htmlTask);
