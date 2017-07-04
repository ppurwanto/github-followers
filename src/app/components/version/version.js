'use strict';

angular
  .module('ghFollowersApp.version', [
    'ghFollowersApp.version.interpolate-filter',
    'ghFollowersApp.version.version-directive'
  ])

  .value('version', '0.1');
