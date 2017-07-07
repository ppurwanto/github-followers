'use strict';

describe('ghFollowersApp.user-followers', () => {

  beforeEach(module('ghFollowersApp.user'));

  describe('UserFollowersController', () => {
    let $httpBackend;
    let ctrl;
    const xyzFollowersList = [{
      login: 'abc',
      avatar_url: 'https://avatars1.githubusercontent.com/u/1234567?v=3'
    }];
    
    beforeEach(inject(($componentController, _$httpBackend_, $routeParams) => {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('https://api.github.com/users/xyz?page=1&per_page=30').respond(xyzFollowersList);

      $routeParams.userName = 'xyz';

      ctrl = $componentController('followersList');
    }));
    
    it('should fetch the followers list', () => {
      //spec body
      jasmine.addCustomEqualityTester(angular.equals);
 
      expect(ctrl.followersList).toBe(undefined);

      $httpBackend.flush();
      expect(ctrl.followersList).toEqual(xyzFollowersList);
    });

  });
});