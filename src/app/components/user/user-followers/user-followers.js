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

  .factory('UserFollowersService', ($resource) => {
    return $resource('https://api.github.com/users/:userName/followers');
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
  
  .filter('paginationListFilter', function () {
    return function(emptyArrToFill, urlWithLastPageNum) {
      let lastPageNum;
        // RegEx, for best resilience
        if (!urlWithLastPageNum ||
            !(lastPageNum = urlWithLastPageNum.match(/[?&]page=(\d+)/i)) ||
            lastPageNum.length < 2) {
          lastPageNum = 1;
        } else {
          lastPageNum = parseInt(lastPageNum[1], 10);
        }
        
        for (let i = 1; i <= lastPageNum; i++) {
          emptyArrToFill.push(i);
        }
      return emptyArrToFill;
    };
  })
  
  .component('userFollowersList', {
    templateUrl: 'app/components/user/user-followers/user-followers.html',
    controller: function UserFollowersController(
        $routeParams, UserFollowersService, PaginationLinkHeaderParserService) {
          const ctrl = this;
          ctrl.requestedUser = $routeParams.userName;
          ctrl.nextPageNumURL = null;
          ctrl.prevPageNumURL = null;
          ctrl.lastPageNumURL = null;
        
          // Use callbacks version instead of $promise for simpler headers extraction:
          //  https://stackoverflow.com/questions/28405862/how-to-access-response-headers-using-resource-in-angular
          ctrl.followers = UserFollowersService.query(
              {
                userName: ctrl.requestedUser,
                page: $routeParams.followerPageNo
              },
              (followers, getResponseHeaders, statusNumber, statusText) => {
                // NOTE: For the pagination:
                // "Always rely on these link relations [=in content of 'Link'
                //   header] provided to you. Don't try to guess or construct your
                //   own URL." - GitHub API
                const curLinkHeader = getResponseHeaders('Link');
                  if (typeof curLinkHeader === 'string') {
                    // We have multiple pages
                    ({
                      next: ctrl.nextPageNumURL,
                      prev: ctrl.prevPageNumURL,
                      last: ctrl.lastPageNumURL
                    } = PaginationLinkHeaderParserService.parse(curLinkHeader));
                    // NOTE: Unused is first: firstPageNum
                  }
//                console.info('Followers List:', ctrl.followers, '| Link Header:',
//                    curLinkHeader, '| Next URL:', ctrl.nextPageNumURL,
//                    '| Prev URL:', ctrl.prevPageNumURL,
//                    '| Last URL:', ctrl.lastPageNumURL);
//                console.log('# API requests remaining for current hour window:',
//                    getResponseHeaders('X-RateLimit-Remaining'),
//                    '| Statuses:', statusNumber, statusText);
              });
        }
  });