'use strict';

// NOTE: For better scalability, separate out these module definitions into
//  each related component.
angular
  .module('ghFollowersApp')

  .config(($locationProvider, $routeProvider) => {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/user-search'});
  });
