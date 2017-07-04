'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('GitHub Followers App', function() {


  it('should automatically redirect to /user when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toMatch("/user");
  });


  describe('user', function() {

    beforeEach(function() {
      browser.get('index.html#!/user');
    });


    it('should render user when user navigates to /user', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for User/);
    });

  });


  describe('view2', function() {

    beforeEach(function() {
      browser.get('index.html#!/view2');
    });


    it('should render view2 when user navigates to /view2', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
