'use strict';

describe('ghFollowersApp.user', () => {

  beforeEach(module('ghFollowersApp.user'));

  describe('UserController', () => {
    let $httpBackend;
    let ctrl;
    const xyzUserData = {
      login: 'xyz',
      followers_url: 'https://api.github.com/users/xyz/followers',
      followers: 100
    };
    
    beforeEach(inject(($componentController, _$httpBackend_, $routeParams) => {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('https://api.github.com/users/xyz').respond(xyzUserData);

      $routeParams.userName = 'xyz';

      ctrl = $componentController('userDetail');
    }));
    
    it('should fetch the user details', () => {
      //spec body
      jasmine.addCustomEqualityTester(angular.equals);
 
      expect(ctrl.user).toEqual({});

      $httpBackend.flush();
      expect(ctrl.user).toEqual(xyzUserData);
    });

  });
});