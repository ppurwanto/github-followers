angular
  .module('ghFollowersApp.common')
  .controller('NavigationController', function($rootScope,
      UserSearchResultsService, KeyboardCodesUtilsService) {
    const ctrl = this;
    ctrl.UserSearchResultsService = UserSearchResultsService;
    
    // *Initialize Materialize CSS Collapsible Mobile Side Nav
    let $mainSearchBoxes;
    
    // Most reliable way is to wait until first route change completed,
    //  signaling Angular is fully ready:
    
    // Listen for any route/view (successful) change
    const detachRouteChangeSuccessListenerForSearchBoxFocus = $rootScope.$on(
        '$routeChangeSuccess', () => {
          $(document).ready(() => {
            // Here can do onload-like initializations
            //  (rough shortcut vs using Directives' link method)
            
            /* Mobile Side Nav. */
            $('.button-collapse').sideNav();
            $(document).keyup((event) => {
              if (KeyboardCodesUtilsService.isEsc(event.which)) {
                $('.button-collapse').sideNav('hide');
              }
            });
            
            $('.close-sidebar-btn').click(() => {
                $('.button-collapse').sideNav('hide')});
            
            /* Search Boxes */
            $mainSearchBoxes = $('.search-boxes');
            
            $('.clear-search-box-btn').click((elm) => {
              // Place focus on search box associated with the clear button
              $(elm.target).parent().prev().children('.search-boxes').first()
                .focus().keyup();
            });
            
            $mainSearchBoxes.first().focus().keyup();
          });
          
          // Ensure this initializer function runs only once
          detachRouteChangeSuccessListenerForSearchBoxFocus();
        });
    
    ctrl.processShortcutKey = (keyCode, isOnMobileSideBarSearchBox) => {
      if (KeyboardCodesUtilsService.isEnter(keyCode)) { // Enter
        ctrl.UserSearchResultsService.fetchResults();
          if (isOnMobileSideBarSearchBox) {
            $('.button-collapse').sideNav('hide');
          }
      }
    };
    
    // TODO: Do animations once view content is loaded using handler like this:
//    $scope.$on('$viewContentLoaded', () => {
//    //Here your view content is fully loaded !!
//    });
  });