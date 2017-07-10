'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('GitHub Followers App', () => {


  it('should redirect `index.html` to `index.html#!/user-search', () => {
    browser.get('index.html');
    expect(browser.getCurrentUrl()).toContain('/user-search');
  });

  describe('User Search View', () => {

    beforeEach(function() {
      browser.get('index.html#!/user-search');
    });


    it('should render the global User Search UI', function() {
      expect(element.all(by.css('.search-boxes')).first().getAttribute('placeholder')).
        toMatch(/Search User/);
    });
  });


  describe('view2', () => {

    beforeEach(() => {
      browser.get('index.html#!/user/test');
    });


    it('should render the "test" user\'s main page with non-zero follower count when user navigates to /user/test', () => {
      expect(element.all(by.css('user-detail h2')).first().getText()).
        toMatch(/User test has [1-9][\d,]* followers?\:/);
    });

  });
});
