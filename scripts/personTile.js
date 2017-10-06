//generic directive to be used across the entire game
//displays a single person
//handles user interaction

window.app.directive('personTile', function() {
  return {
    scope: true,
    templateUrl: '/views/personTile.html',
    controllerAs: 'pTCtrl',
    bindToController: {
      person: '=',
      isReview: '=',
      isStat: '=',
      attempts: '='
    },
    controller: function() {
      var self = this;
      

    },
  };
});
