'use strict';

describe('ghFollowersApp.version module', function() {
  beforeEach(module('ghFollowersApp.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
