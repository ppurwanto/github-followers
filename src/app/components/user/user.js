'use strict';

angular
  .module('ghFollowersApp.user', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/user', {
      templateUrl: 'app/components/user/user.html',
      controller: 'UserCtrl'
    });
  }])

  .controller('UserCtrl', [function() {

  }]);