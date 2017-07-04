'use strict';

angular
  .module('ghFollowersApp.version.version-directive', [])

  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
