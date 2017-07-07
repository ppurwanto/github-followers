'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('GitHub Followers App', () => {


  it('should redirect `index.html` to `index.html#!/user-search', () => {
    browser.get('index.html');
    expect(browser.getCurrentUrl()).toBe('/user-search');
  });

  describe('User Search View', () => {

    beforeEach(function() {
      browser.get('index.html#!/user-search');
    });


//    it('should render User Search UI when user navigates to /search', function() {
//      expect(element.all(by.css('[ng-view] p')).first().getText()).
//        toMatch(/partial for User/);
//    });
    
//    it('should show correct pluralized followers count string', function() {
//      var withoutOffset = element.all(by.css('ng-pluralize')).get(0);
//      var withOffset = element.all(by.css('ng-pluralize')).get(1);
//      var countInput = element(by.model('personCount'));
//
//      expect(withoutOffset.getText()).toEqual('1 person is viewing.');
//      expect(withOffset.getText()).toEqual('Igor is viewing.');
//
//      countInput.clear();
//      countInput.sendKeys('0');
//
//      expect(withoutOffset.getText()).toEqual('Nobody is viewing.');
//      expect(withOffset.getText()).toEqual('Nobody is viewing.');
//
//      countInput.clear();
//      countInput.sendKeys('2');
//
//      expect(withoutOffset.getText()).toEqual('2 people are viewing.');
//      expect(withOffset.getText()).toEqual('Igor and Misko are viewing.');
//
//      countInput.clear();
//      countInput.sendKeys('3');
//
//      expect(withoutOffset.getText()).toEqual('3 people are viewing.');
//      expect(withOffset.getText()).toEqual('Igor, Misko and one other person are viewing.');
//
//      countInput.clear();
//      countInput.sendKeys('4');
//
//      expect(withoutOffset.getText()).toEqual('4 people are viewing.');
//      expect(withOffset.getText()).toEqual('Igor, Misko and 2 other people are viewing.');
//    });

  });


  describe('view2', () => {

    beforeEach(() => {
      browser.get('index.html#!/view2');
    });


    it('should render view2 when user navigates to /view2', () => {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
