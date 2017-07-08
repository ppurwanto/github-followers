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
  //  [Maybe even save to localStorage, etc.]
  // TODO: Check headers, like 'If-Modified-Since' etc., to help determine
  //  whether to use cache whenever possible:
  //  https://developer.github.com/v3/#conditional-requests
  .factory('UserResourceWithHeadersService', ($resource) => {
    return {
      /**
       * 
       * @param {string} URLTemplateOrPresetName The only required param.\
       * @param {{method: (string|undefined),
       *     isArray: (boolean|undefined),
       *     defaultParams: (string|undefined)}=} param1
       *      method: HTTP request method. Defaults to GET. Supply 'query'
       *        custom shortcut to set this to 'GET' & isArray to true, together.
       *      isArray: Outputs an array. Defaults to false.
       *      defaultParams: Defaults to undefined.
       * @returns {Object} The $resource, with successful callback will be
       *  containing the .getResponseHeaders() method as the first param. of
       *  the callback.
       */
      build: (URLTemplateOrPresetName, {method = 'GET', isArray = false,
          defaultParams = undefined} = {}) => {
            if (method === 'query') { // Custom shortcut
              method = 'GET';
              isArray = true;
            }
          let presetBaseURL = 'https://api.github.com/';
          let finalURL = presetBaseURL;
          
            // NOTE: To be more resilient to changes, can first get the 'user_url'
            //    format from root API @ https://api.github.com/
            // NOTE: Using REST here for demonstration & future expanded purposes,
            //  especially since GitHub's API is also REST-based;
            //  but, since we only do GET requests now, could've also just used
            //  $http.get()
            switch (URLTemplateOrPresetName) {
              case 'search':
                finalURL += 'search/users';
                break;
              case 'user': /* no-break */
              case 'users':
                finalURL += 'users/:userName';
                break;
              case 'followers':
              case 'follower': /* no-break */
                finalURL += 'users/:userName/followers';
                break;
              default:
                finalURL = URLTemplateOrPresetName;
                break;
            }
        return $resource(finalURL, defaultParams, {
          obtainWithHeaders: {
            method: method,
            isArray: isArray,
            interceptor: {
              response: function(response) {
                  if (!response.resource.getResponseHeaders) {
                    response.resource.getResponseHeaders = response.headers;
                  } else {
                    console.error(`userSearch resource: Canceled attempt to
                        override pre-existing getResponseHeaders()`);
                  }
                return response.resource;
              }
            }
          }
        });
      }
    };
  })

  .factory('UserService', (UserResourceWithHeadersService) => {
    return UserResourceWithHeadersService.build('user');
  })
  
  .factory('UserErrorMessagingService', () => {
    /**
     * A class object to cut down on duplicate toasts being displayed
     *    within a short period of time
     */
    const ExcessiveToastsManager = {
      /**
       * NOTE: Must first immediately run this after declaration, to initialize.
       */
      reset: function() {
        this.timeLimitWindowMillis = 1000;
        this.quantityLimitWithinTimeLimitWindow = 3;
        this.coolDownMillisForNewOnesAfterCurrentOneIsDismissedByUser = 3000;
        
        // Don't change these defaults
        this.timeMillisOfFirstDisplayedWithinTimeLimitWindow = 0;
        this.numDisplayedWithinTimeLimitWindow = 0;
      },
      /**
       * 
       * @returns {boolean}
       */
      newAllowed: function() {
        const curTimeMillis = Date.now();
        return (
            curTimeMillis - this.timeMillisOfFirstDisplayedWithinTimeLimitWindow)
                > this.timeLimitWindowMillis ||
            (this.numDisplayedWithinTimeLimitWindow + 1) <=
                this.quantityLimitWithinTimeLimitWindow;
      },
      /**
       * Returns false without recording if new not allowed.
       * True and resets all otherwise.
       * @returns {boolean}
       */
      recordNew: function() {
          if (!this.newAllowed()) {
            return false;
          }
        const curTimeMillis = Date.now();
          // Clear records that are too old
          if ((curTimeMillis -
                  this.timeMillisOfFirstDisplayedWithinTimeLimitWindow)
              > this.timeLimitWindowMillis) {
            this.numDisplayedWithinTimeLimitWindow = 0;
          }
          
          // First new record within time window
          if (this.numDisplayedWithinTimeLimitWindow++ === 0) {
            this.timeMillisOfFirstDisplayedWithinTimeLimitWindow = curTimeMillis;
          }
        return true;
      },
      /**
       * Use when toast dismissed by user prematurely
       */
      applyUserCoolDown: function() {
        // Set to future
        this.timeMillisOfFirstDisplayedWithinTimeLimitWindow = Date.now() +
            this.coolDownMillisForNewOnesAfterCurrentOneIsDismissedByUser;
        this.numDisplayedWithinTimeLimitWindow =
            this.quantityLimitWithinTimeLimitWindow; // Set to max
      }
    };
    ExcessiveToastsManager.reset(); // Required immediate init
    
    let errMsg = '';
    
    return {
      get: () => errMsg,
      hasError: () => errMsg !== '',
      set: (newErrMsg) =>  errMsg = newErrMsg,
      append: (newPartialErrMsg) => errMsg += newPartialErrMsg,
      clear: () => errMsg = '',
      showToast: (durationSecs = 5, labelPrefix = true) => {
          if (!ExcessiveToastsManager.recordNew()) {
            return;
          }
        Materialize.toast((labelPrefix ? 'ERROR: ' : '') + errMsg,
        durationSecs * 1000, '', () => {
          ExcessiveToastsManager.applyUserCoolDown();
        });
      },
      processAndDisplayErrorObjectInUserFriendlyWay: function(errorResponse,
          opt_numRequestLimitRemain, opt_timestampSecsTillLimitReset,
          opt_numRequestsLimitPerHour) {
          // Generics based on code
          switch (errorResponse.status) {
            case 404:
              errMsg = 'User Not Found!';
              break;
            case 403:
              errMsg = 'User Not Allowed To Be Searched!';
              break;
            case 500:
              errMsg = 'GitHub\'s Servers May Be Down/Having A Problem!';
              break;
            default: // All other numbers
              errMsg = 'FAILED to fetch results';
              break;
          }

          if (opt_numRequestLimitRemain < 1 ||
              (errorResponse && errorResponse.data)) {
            // Specifics: Request Limits
            if (/limit\s+exceed/i.test(errorResponse.data.message)) {
              // TODO: Use Tagged String Templates, like:
              /*
                  var apiTimeoutTag = (staticStrParts, timeLimitExp, minutesExp) => {
                    return staticStrParts[0] + timeLimitExp + staticStrParts[1] + minutesExp;
                  };
                  UserErrorMessagingService.set(apiTimeoutTag`for ${timeLimit} ${minutes}`);
               */

              const timeSecsTillLimitReset =
                  opt_timestampSecsTillLimitReset !== undefined ?
                  opt_timestampSecsTillLimitReset - (Date.now() / 1000) :
                  undefined;
              errMsg = `Sorry! You've exceeded the
                  ${opt_numRequestsLimitPerHour === undefined ?
                      '' : opt_numRequestsLimitPerHour}
                  queries limit per hour. Please wait
                  ${timeSecsTillLimitReset >= 0 &&
                      timeSecsTillLimitReset < 3600 ?
                  'for ' + (timeSecsTillLimitReset / 60).toFixed(1) +
                      ' minutes' :
                  'about up to another hour'}
                  and try again (or try to search for a different user).`;
            } else { // General, server-issued error message
              errMsg += ': "' +
                  (errorResponse.data.mesage.length > 30 ?
                  errorResponse.data.mesage.substring(0, 30) :
                  errorResponse.data.mesage) + '"';
            }
          }
        this.showToast(10);
      }
    };
  })
  
  .component('userDetail', {
    templateUrl: 'app/components/user/user.html',
    // REMEMBER: Don't use ES6 arrow function for controller, as it won't
    //  bind 'this' to the controller & point to enclosing scope instead (MDN)
    controller: function UserController($routeParams, UserService,
        UserErrorMessagingService) {
      const ctrl = this;
      ctrl.requestedUser = $routeParams.userName;
      // Use callbacks version instead of $promise for simpler headers extraction:
      //  https://stackoverflow.com/questions/28405862/how-to-access-response-headers-using-resource-in-angular
      UserService.get({userName: ctrl.requestedUser}).$promise.then(
          (user) => {
            UserErrorMessagingService.clear();
            ctrl.user = user;
          }).catch((errorResponse) => {
            UserErrorMessagingService.
                processAndDisplayErrorObjectInUserFriendlyWay(errorResponse);
          }); // TODO: Handle request errors/rejections for all the views
          
      ctrl.UserErrorMessagingService = UserErrorMessagingService;
    }
  });