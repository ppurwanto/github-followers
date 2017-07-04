'use strict';

// Declare app level module which depends on views, and components
// NOTE: For better scalability, separate out these module definitions into
//  each related component.
angular
  .module('ghFollowersApp', [
    'ngRoute',
    'ghFollowersApp.user',
    'ghFollowersApp.view2',
    'ghFollowersApp.version'
  ]);
