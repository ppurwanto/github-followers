angular
  .module('ghFollowersApp.nav', ['ghFollowersApp.user'])
  .controller('NavigationController', function(
      $rootScope,
      $location,
      UserSearchResultsService) {
    // *Initialize Materialize CSS Collapsible Mobile Side Nav
    let $mainSearchBoxes;
    let $clearSearchBoxBtns;
    
    // Most reliable way is to wait until first route change completed,
    //  signaling Angular is fully ready:
    
    // Listen for any route/view (successful) change
    const detachRouteChangeSuccessListener = $rootScope.$on(
        '$routeChangeSuccess',
        () => {
          $(document).ready(() => {
            // Here can do onload-like initializations
            //  (rough shortcut vs using Directives' link method)
            $('.button-collapse').sideNav(); // Mobile Side Nav.

            // Reset & focus on search box
            $mainSearchBoxes = $('.search-boxes');
            $clearSearchBoxBtns = $('.clear-search-box-btn');
            $clearSearchBoxBtns.click(function() {
              // Place focus on search box associated with the clear button
              $(this).parent().prev().children('.search-boxes').first()
                  .focus().keyup();
            });
            $mainSearchBoxes.first().focus().keyup();
            
            $mainSearchBoxes.focus(() => {
              if (/\/user\//.test($location.path())) {
//                $location.path('/');
              }
            });
          });
          
          detachRouteChangeSuccessListener(); // Ensure run only once
        });
    
    // Ensure if we click on the sidebar (producing route change), that it's
    //  collapsed (hidden) again.
    $rootScope.$on('$routeChangeStart',
        () => {
          $(document).ready(() => {
            $(".button-collapse").sideNav('hide');
              if ($clearSearchBoxBtns) {
                $('.clear-search-box-btn').click();
              }
          });
        });
    
    const ctrl = this;
    ctrl.UserSearchResultsService = UserSearchResultsService;
  });