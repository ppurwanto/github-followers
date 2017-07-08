'use strict';

angular
  .module('ghFollowersApp.user')

  .config(($routeProvider) => {
    $routeProvider
      .when('/user/:userName/followers', {
        template: '<user-followers-list></user-followers-list>'
      })
      .when('/user/:userName/followers/:followerPageNo', {
        template: '<user-detail></user-detail>'
      });
  })

  .factory('UserFollowersService', (UserResourceWithHeadersService) => {
    return UserResourceWithHeadersService.build('followers', {method: 'query'});
  })
  
  .factory('PaginationLinkHeaderParserService', () => {
    const linkHeaderParserRegEx = /(?:,\s*)?<(.+?)>;\s*rel="(.+?)"/gi;
    
    return {
      parse: (linkHeaderStr) => {
        // TODO: Document Link parser RegEx better with backticks
        //  and spacing, etc. and use a visualizer:
        //  https://jex.im/regulex/
        // Use case- & space-INsensitive matching for resilience
        let extractedMatches = {/*next: 'http://...', last: '...' */};
        let curMatches;
          while ((curMatches = linkHeaderParserRegEx.exec(linkHeaderStr)) !== null) {
              if (curMatches.length < 3) {
                console.warn('Possible invalid Link Header matches:', curMatches);
                continue;
              }
            extractedMatches[curMatches[2]] = curMatches[1];
          }
        return extractedMatches;
      }
    };
  })
  
  .factory('pageNumberInURLExtractionService', function() {
    // RegEx & case-INsensitive, for best resilience
    const pageNumberParserRegEx = /[?&]page=(\d+)/i;
    
    return {
      /**
       * 
       * @param {string} urlString
       * @returns {number|undefined}
       */
      extract: (urlString) => {
        let matches;
          if (typeof urlString !== 'string' ||
              !(matches = urlString.match(pageNumberParserRegEx)) ||
              matches.length < 2) {
            return;
          }
        return parseInt(matches[1], 10);
      }
    };
  })
  
  .filter('paginationListFilter', function() {
    return function(emptyArrToFill, urlWithLastPageNum, urlWithPrevPageNum) {
      let lastPageNum;
      let baseLastPageUsingPrevPage = !urlWithLastPageNum && urlWithPrevPageNum;
        // RegEx & case-INsensitive, for best resilience
        if ((!urlWithLastPageNum && !urlWithPrevPageNum) ||
            !(lastPageNum = (!baseLastPageUsingPrevPage ? urlWithLastPageNum :
                urlWithPrevPageNum).match(/[?&]page=(\d+)/i)) ||
            lastPageNum.length < 2) {
          lastPageNum = 1;
        } else {
          lastPageNum = parseInt(lastPageNum[1], 10);
            if (baseLastPageUsingPrevPage) {
              lastPageNum++;
            }
        }
        
        for (let i = 1; i <= lastPageNum; i++) {
          emptyArrToFill.push(i);
        }
      return emptyArrToFill;
    };
  })
  
  .component('userFollowersList', {
    templateUrl: 'app/components/user/user-followers/user-followers.html',
    // TODO: Complete keeping track of true follower count vs given to calc. hidden followers
//    bindToController: {
//      trueFollowerCount: '='
//    },
    controller: function UserFollowersController(
        $routeParams, UserFollowersService, PaginationLinkHeaderParserService,
        pageNumberInURLExtractionService, UserErrorMessagingService) {
          const ctrl = this;
          ctrl.requestedUser = $routeParams.userName;
          // Stick with natural 'undefined'
//          ctrl.nextPageNumURL = null;
//          ctrl.prevPageNumURL = null;
//          ctrl.lastPageNumURL = null;
        
//          ctrl.numHiddenFollowers = 0; // From tests, these can exist
          // Use callbacks version instead of $promise for simpler headers extraction:
          //  https://stackoverflow.com/questions/28405862/how-to-access-response-headers-using-resource-in-angular
          UserFollowersService.obtainWithHeaders({
                userName: ctrl.requestedUser,
                page: $routeParams.followerPageNo
              }).$promise.then((followers) => {
                ctrl.followers = followers;
                UserErrorMessagingService.clear();
//                ctrl.numHiddenFollowers = ctrl.trueFollowerCount - followers.length;
//                  if (ctrl.numHiddenFollowers < 0) {
//                    ctrl.numHiddenFollowers = 0;
//                  }
                // NOTE: For the pagination:
                // "Always rely on these link relations [=in content of 'Link'
                //   header] provided to you. Don't try to guess or construct your
                //   own URL." - GitHub API
                const curLinkHeader = followers.getResponseHeaders('Link');
                  if (typeof curLinkHeader === 'string') {
                    // We have multiple pages
                    ({
                      next: ctrl.nextPageNumURL,
                      prev: ctrl.prevPageNumURL,
                      last: ctrl.lastPageNumURL
                    } = PaginationLinkHeaderParserService.parse(curLinkHeader));
                    // NOTE: Unused is first: firstPageNum
                  }
              }).catch((errorResponse) => {
                UserErrorMessagingService.
                    processAndDisplayErrorObjectInUserFriendlyWay(errorResponse);
              });
              
          /**
           * Compares given number against number in URL/$routeParams
           * @param {number} pageNum
           * @returns {boolean}
           */
          ctrl.pageNumIsCurrent = (pageNum) => {
            const pageNumInURL = parseInt($routeParams.followerPageNo, 10);
            return isNaN(pageNumInURL) && pageNum === 1 ||
                pageNum === pageNumInURL;
          };
          
          ctrl.UserErrorMessagingService = UserErrorMessagingService;
        }
  });