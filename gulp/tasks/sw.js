const gulp = require('gulp');
const project = require('../project');

gulp.task('sw', project.serviceWorker);
module.exports = project.serviceWorker;
