'use strict';

angular
  .module('ghFollowersApp.user')
  
  .config(($routeProvider) => {
    $routeProvider.when('/user-search', {
      template: '<user-search-form></user-search-form>'
    });
  })

  .factory('UserSearchService', ($resource) => {
    return $resource('https://api.github.com/search/users');
  })
  
  .service('UserSearchResultsService', function(UserSearchService, $location, $timeout) {
    const svc = this;
    let delayedFetchTimerPromise;

    const autoCompleteNewResultsLimit = 10;
    const autoCompleteCachedResultsLimit = 100;
    
    // Helper vars for below method, fetchResultsDelayed
    //  NOTE: If gets more complex, encapsulate together into a class/object
    let infrequentActivityThrottleMode = true;
    const infreqThrotDelayMillis = 2000;
    const freqThrotDelayMillis = 1000;
    
    // Never empty out/reset this value (use results like cache)
    svc.resultsInMCSSAutoCompleteFormat = {};

    (svc.clearSearchQuery = () => {
      svc.searchQuery = '';
      // Do related resets
      svc.results = {};
        if (delayedFetchTimerPromise !== undefined) {
          $timeout.cancel(delayedFetchTimerPromise);
          delayedFetchTimerPromise = undefined;
        }
    }).call(); // IIFE with arrow func.

    svc.fetchResults = () => {
        if (!svc.searchQuery.length) {
//            console.warn('Attempted to fetch with empty search query.');
          return;
        }
      // NOTE: Usernames of length 1 DO exist.
      
      // TODO: Instead of resetting upon search box focus,
      //  detect (but more complex) if we're on a user results
      //  page but user wants to search again, so we've to reset.
      //  Already started with below code, but still not desirable:
//        if (/\/user\//.test($location.path())) {
//          console.log('Resetting to search results page/root from this old path:',
//              $location.path());
//          $location.path('/');
//        }

      svc.results = UserSearchService.get(
          {q: svc.searchQuery},
          (results, getResponseHeaders, statusNumber, statusText) => {
            // WARNING: "To keep the Search API fast for everyone, we limit
            //  how long any individual query can run. For queries that exceed
            //  the time limit, the API returns the matches that were already
            //  found prior to the timeout, and the response has the
            //  incomplete_results property set to true."

            // TODO: Move these and the notifier below into own rate limit
            //    monitoring/management service
            svc.numRequestsLimitPerHour = getResponseHeaders('X-RateLimit-Limit');
            svc.numRequestLimitRemain = getResponseHeaders('X-RateLimit-Remaining');
            svc.timestampSecsTillLimitReset = getResponseHeaders('X-RateLimit-Reset');
              if (svc.results.items && svc.results.items.length) {
                angular.forEach(
                    svc.results.items.slice(0, autoCompleteNewResultsLimit),
                    (value) => {
                      svc.resultsInMCSSAutoCompleteFormat[value.login] =
                          value.avatar_url;
                    });
                    
                let curMCACCacheKeys = Object.keys(
                    svc.resultsInMCSSAutoCompleteFormat);
                const numElmsToTrim = curMCACCacheKeys.length -
                    autoCompleteCachedResultsLimit;
            
                    if (numElmsToTrim > 0) {
                      for (let curKeyIdx = 0; curKeyIdx < numElmsToTrim;
                          curKeyIdx++) {
                        delete svc.resultsInMCSSAutoCompleteFormat[
                            curMCACCacheKeys[curKeyIdx]];
                      }
                    }

                $('.search-boxes').autocomplete({
                  data: svc.resultsInMCSSAutoCompleteFormat,
                  limit: autoCompleteNewResultsLimit,
                  onAutocomplete: (value) => {
                    svc.fetchResults();
                    // TODO: Fix below autocomplete redirect onclick not reliable:
//                    $location.path('/user/' + value);
                  }
                });
              }
          },
          (errorResponse) => {
            let errMsg = 'FAILED to fetch results';
              if (svc.numRequestLimitRemain < 1 ||
                  (errorResponse && errorResponse.data)) {
                if (/limit\s+exceed/i.test(errorResponse.data.message)) {
                  errMsg = `Sorry! You've exceeded the
                      ${svc.numRequestsLimitPerHour
                          === undefined ? '' : svc.numRequestsLimitPerHour}
                      queries limit per hour. Please wait
                      ${svc.timestampSecsTillLimitReset
                          === undefined ? 'about up to another hour' :
                          'for ' + (svc.timestampSecsTillLimitReset / 60) +
                          'minutes'}
                      and try again.`;
                } else {
                  errMsg += ': "' + errorResponse.data.mesage.substring(0, 30) +
                      '"';
                }
              }
            Materialize.toast(errMsg, 10000);
          });
    };

    /**
     * Delayed fetch version to limit extraneous API calls & save quota.
     * @param {number} opt_delayMillis Overwrites default delays
     */
    svc.fetchResultsDelayed = (opt_delayMillis) => {
        if (delayedFetchTimerPromise === undefined) { // Not delayed yet = infreq.
          delayedFetchTimerPromise = $timeout(
              svc.fetchResults,
              isNaN(opt_delayMillis) ?
                  (!infrequentActivityThrottleMode ?
                      freqThrotDelayMillis : infreqThrotDelayMillis) :
                  opt_delayMillis);

          // Clear promise to be overwritten by subsequent requests
          delayedFetchTimerPromise.then(() => {
            delayedFetchTimerPromise = undefined;
//            console.log('Delay done: Now fetching user search results @ ',
//                Date.now());
          }).catch(() => {/* Do Nothing */});

          infrequentActivityThrottleMode = true; // Reset
        } else { // Currently already delayed = frequent search typing
          infrequentActivityThrottleMode = false;
        }

        // Alternatively (though doesn't fit well), can delay model updates
        //  instead with this HTML attribute:
        //    ng-model-options="{debounce: 2000}"
        //    (Adds 2 second delay/"debounce" before evaluating model)
        // Were we using the delayed ng-model with debounce where ng-keyup can
        //  separately fire, we'll also need this:
        //    $scope.$watch('searchQuery', () => {
        //      svc.fetchResults();
        //    });
    };
  })
  
  .component('userSearchForm', {
    templateUrl: 'app/components/user/user-search/user-search.html',
    controller: function UserSearchController(UserSearchResultsService) {
      const ctrl = this;
      ctrl.UserSearchResultsService = UserSearchResultsService;
    }
  });