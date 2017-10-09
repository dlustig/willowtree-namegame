//Free play directive
//display 5 random tiles at a time, no timer applied
//on initial correct choice, remove tile from active array
//on incorrect choice, increment fail on tile, by number of tiles chosen before correct option. will be retried again later
//to win, guess all names correctly on first try


window.app.directive('reviewDirective', function(reviewService) {
  return {
    scope: {},
    templateUrl: '/views/review.html',
    controllerAs: 'rCtrl',
    controller: function($rootScope, $scope) {
      var self = this;

      function initialize(){
        self.rounds = reviewService.getRounds();
      }




      initialize();

    },
  };
});
