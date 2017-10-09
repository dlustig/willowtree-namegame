
window.app.directive('reviewDirective', function(reviewService) {
  return {
    scope: {},
    templateUrl: '/views/review.html',
    controllerAs: 'rCtrl',
    controller: function($rootScope, $scope) {
      var self = this;

      function initialize(){
        self.rounds = reviewService.getRounds();

        //auto select first tab
        self.selectedIndex = 0;
      }




      initialize();

    },
  };
});
