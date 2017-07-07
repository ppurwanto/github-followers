'use strict';

angular
  .module('ghFollowersApp.user')

  .config(($routeProvider) => {
    $routeProvider.when('/user/:userName', {
      template: '<user-detail></user-detail>'
    });
  })

  // TODO: Cache results (or even specify ID & secret if this were server) to
  //  save on rate limits (viewable via 'X-RateLimit-Remaining' HTTP Response
  //  Header = [As of writing:] the max # of requests allowed in current
  //  hour window, default 60):
  //  https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
  // TODO: Check headers, like 'If-Modified-Since' etc., to help determine
  //  whether to use cache whenever possible:
  //  https://developer.github.com/v3/#conditional-requests
  .factory('UserService', ($resource) => {
    // NOTE: To be more resilient to changes, can first get the 'user_url'
    //    format from root API @ https://api.github.com/
    // NOTE: Using REST here for demonstration & future expanded purposes,
    //  especially since GitHub's API is also REST-based;
    //  but, since we only do GET requests now, could've also just used
    //  $http.get()
    return $resource('https://api.github.com/users/:userName');
  })
  
  .component('userDetail', {
    templateUrl: 'app/components/user/user.html',
    // REMEMBER: Don't use ES6 arrow function for controller, as it won't
    //  bind 'this' to the controller & point to enclosing scope instead (MDN)
    controller: function UserController($routeParams, UserService) {
      const ctrl = this;
      ctrl.requestedUser = $routeParams.userName;
      // Use callbacks version instead of $promise for simpler headers extraction:
      //  https://stackoverflow.com/questions/28405862/how-to-access-response-headers-using-resource-in-angular
      ctrl.user = UserService.get(
          {userName: ctrl.requestedUser},
          (user, getResponseHeaders, statusNumber, statusText) => {
//            console.info('User Detail:', ctrl.user);
//            console.log('# API requests remaining for current hour window:',
//                getResponseHeaders('X-RateLimit-Remaining'),
//                '| Statuses:', statusNumber, statusText);
          }); // TODO: Handle request errors/rejections for all the views
    }
  });