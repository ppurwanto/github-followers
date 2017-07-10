'use strict';

angular
  .module('ghFollowersApp.user')
  
  .config(($routeProvider) => {
    /**
     * Optionally accepts a searchQuery URL parameter
     */
    $routeProvider.when('/user-search/:searchQuery?', {
      template: '<user-search-form></user-search-form>'
    });
  })

  // Since we need to get the headers AND being able to use .then().catch() on
  //   promises to avoid causing Angular's "possibly unhandled exceptions",
  //   use an interceptor, based on:
  //   https://stackoverflow.com/questions/22898265/get-response-header-in-then-function-of-a-ngresource-objects-promise-propert
  .factory('UserSearchService', (UserResourceWithHeadersService) => {
    return UserResourceWithHeadersService.build('search');
  })

  .service('UserSearchResultsService', function(UserSearchService, $timeout,
      $location, UserErrorMessagingService) {
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

    // TODO: Move into link function once can have userSearch directive:
    /**
     * @param {boolean} showIfTrue Supply true to show; false to hide
     */
    svc.toggleLoadingBar = (showIfTrue) => {
      let $loadingBarElm = $('#user-search-nav .progress');
      
        if (showIfTrue) {
          $loadingBarElm.fadeOut(0).removeClass('hide').fadeIn(250);
        } else {
          $loadingBarElm.fadeOut(2000, () => {
            $loadingBarElm.addClass('hide');
          });
        }
    };

    svc.fetchResults = () => {
      UserErrorMessagingService.clear();
        if (typeof svc.searchQuery !== 'string' || !svc.searchQuery.length) {
//            console.warn('Attempted to fetch with empty search query.');
          return;
        }
      // NOTE: Usernames of length 1 DO exist.
      
        if (!/\/user-search\b/.test($location.path())) {
          // NOTE: Angular already auto-encodes URLs
          $location.path('/user-search/' + svc.searchQuery);
          return;
        }
      svc.toggleLoadingBar(true);

      UserSearchService.obtainWithHeaders({q: svc.searchQuery}).$promise.then(
          (results) => {
            // WARNING: "To keep the Search API fast for everyone, we limit
            //  how long any individual query can run. For queries that exceed
            //  the time limit, the API returns the matches that were already
            //  found prior to the timeout, and the response has the
            //  incomplete_results property set to true."

            // TODO: Move these and the notifier below into own rate limit
            //    monitoring/management service
            svc.numRequestsLimitPerHour = results.
                getResponseHeaders('X-RateLimit-Limit');
            svc.numRequestLimitRemain = results.
                getResponseHeaders('X-RateLimit-Remaining');
            svc.timestampSecsTillLimitReset = results.
                getResponseHeaders('X-RateLimit-Reset');
            svc.results = results;
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
                    //* An autocomplete suggestion has been clicked
                    $('.button-collapse').sideNav('hide');
                    
                    // To prevent causing conflicts with redirects thinking
                    //    we need to go back to search results view
                    svc.clearSearchQuery();
                    
                    $location.path('/user/' + value);
                  }
                });
                
                $('.search-boxes').keyup();
              }
            svc.toggleLoadingBar(false);
//            console.log('User Search Results completed.');
          }).catch((errorResponse) => {
            UserErrorMessagingService.
                processAndDisplayErrorObjectInUserFriendlyWay(errorResponse,
                    svc.numRequestLimitRemain, svc.timestampSecsTillLimitReset,
                    svc.numRequestsLimitPerHour);
            svc.toggleLoadingBar(false);
          });
    };

    /**
     * Delayed fetch version to limit extraneous API calls & save quota.
     * @param {number} opt_delayMillis Overwrites default delays
     */
    svc.fetchResultsDelayed = (opt_delayMillis) => {
      UserErrorMessagingService.clear();
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
    };
  })
  
  .component('userSearchForm', {
      templateUrl: 'app/components/user/user-search/user-search.html',
      controller: function UserSearchController(UserSearchResultsService,
          UserErrorMessagingService, $routeParams) {
        const ctrl = this;
        ctrl.UserSearchResultsService = UserSearchResultsService;
        ctrl.UserErrorMessagingService = UserErrorMessagingService;
          // Track/mirror queries via direct URL requests (only if not already
          //  the same as current query in the model)
          if ((typeof $routeParams.searchQuery === 'string') &&
              $routeParams.searchQuery !== '') {
            // TODO: Find a way without this hack-ish delay needed since view change will overwrite otherwise
            setTimeout(()=>{
              ctrl.UserSearchResultsService.searchQuery = $routeParams.searchQuery;
              ctrl.UserSearchResultsService.fetchResults();
            }, 100);
          }
      }
  });