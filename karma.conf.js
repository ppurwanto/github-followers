//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './src',

    // list of files / patterns to load in the browser that are needed to run
    //  the tests (including all needed libraries)
    files: [
      'assets/libs/bower_components/angular/angular.js',
      'assets/libs/bower_components/angular-*/angular-*.js',
      'app/**/*.module.js', // Modules first
      'app/**/*!(.module|.spec).js', // NON-modules & NON-specs next
      'app/**/*.spec.js' // Specs/tests finally
    ],

    // list of files to exclude
    exclude: [
    ],

    autoWatch: true,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'], // Also try: 'Firefox', 'PhantomJS'

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-junit-reporter'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },
    
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    //logLevel: config.LOG_DEBUG,

//    // Continuous Integration mode
//    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
//
//    // Concurrency level
//    // how many browser should be started simultaneous
//    , concurrency: Infinity

  });
};
