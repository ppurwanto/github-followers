angular
  .module('ghFollowersApp.common')
  .factory('KeyboardCodesUtilsService', () => {
    return {
      /**
       * @type enum
       */
      CODES : {
        ENTER: 13,
        ESC: 27
      },
      isEnter: function(key) {
        return key === this.CODES.ENTER;
      },
      isEsc: function(key) {
        return key === this.CODES.ESC;
      }
    };
  });