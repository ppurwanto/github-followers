'use strict';

describe('ghFollowersApp.user-search', () => {

  beforeEach(module('ghFollowersApp.user'));

  describe('UserSearchController', () => {
    let $httpBackend;
    let ctrl;
    const xyzUserSearchResults = {
      total_count: 2,
      incomplete_results: false,
      items: [
        {
          login: 'xyz',
          avatar_url: 'https://avatars3.githubusercontent.com/u/1234567?v=3'
        },
        {
          login: 'abc',
          avatar_url: 'https://avatars3.githubusercontent.com/u/1234568?v=3'
        }
      ]
    };
    
    beforeEach(inject(($componentController, _$httpBackend_) => {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('https://api.github.com/users/xyz?page=1&per_page=30').respond(xyzUserSearchResults);

      ctrl = $componentController('userSearchForm');
    }));
    
    it('should fetch the user search results', () => {
      //spec body
      // TODO: Handle the Link Header format like in this example (& similarly
      //  for user-followers):
      //  '<https://api.github.com/search/users?q=ABCDEF&page=2>; rel="next", <https://api.github.com/search/users?q=ABCDEF&page=13>; rel="last"'
      
      jasmine.addCustomEqualityTester(angular.equals);
 
      expect(ctrl.results).toBe({});

      $httpBackend.flush();
      expect(ctrl.results).toEqual(xyzUserSearchResults);
    });

  });
});