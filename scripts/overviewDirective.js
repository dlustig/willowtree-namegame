window.app.directive('overviewDirective', function() {
  return {
    templateUrl: '/views/overview.html',
    restrict: 'AE',
    scope: true,
    controllerAs: 'oCtrl',
    controller: ['$scope', 'dataService','$timeout',
    function($scope, dataService, $timeout) {

      var self = this;
    }],
  };
});
