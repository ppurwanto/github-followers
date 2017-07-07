'use strict';

var gulp = require('gulp'),
    KarmaServer = require('karma').Server;

// TODO: Before minification run AngularJS code thru
//  'babel-plugin-angularjs-annotate' Gulp plugin,
//  [https://github.com/schmod/babel-plugin-angularjs-annotate]
//  then add to .babelrc file:
//{
//  "presets": ["es2015"],
//  "plugins": ["angularjs-annotate"]
//}

// TODO: Since currently no console.* statements intended for production,
//  simply strip them all out using an option with uglify()

// Adapted from this Karma Runner: https://github.com/karma-runner/gulp-karma/blob/master/gulpfile.js
function karmaRun(done, opt_singleRun) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: (opt_singleRun === true ? true : false)
  }, function(exitCode) {
      if (exitCode !== 0) {
        console.error('Karma has exited abnormally, with code ' + exitCode);
      }
      if (typeof done === 'function') {
        done();
      }
      
      // Don't exit root process so can continue watches & just rely on fallback
      //  auto timeout.
      // This is still an ongoing, known issue with Karma as of writing:
      // https://github.com/karma-runner/gulp-karma/pull/23#issuecomment-232313832
      //process.exit(exitCode);
  }).start();
}

// Run test once and exit
gulp.task('karma-run', function (done) { karmaRun(done, true); });

// Watch for file changes and re-run tests on each change
gulp.task('karma-watch', function(done) { karmaRun(done); });

// Alternatively, use Gulp Watch
gulp.task('karma-gulp-watch', ['karma-run'], function() {
  gulp.watch(__dirname + '/src/app/**/*.spec.js', ['karma-run']);
});

gulp.task('test', ['karma-gulp-watch']);

gulp.task('default', ['karma-gulp-watch']);