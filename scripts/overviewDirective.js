window.app.directive('overviewDirective', function() {
  return {
    templateUrl: '/views/overview.html',
    restrict: 'AE',
    scope: true,
    controllerAs: 'oCtrl',
    controller: ['$scope', 'dataService',
    function($scope, dataService) {

      var self = this;

      function initialize(){
        self.hoverIndex = 3;
        self.shortcutDemoArray = angular.copy(dataService.getActiveWotPeopleWithImage()).slice(0,5);
        self.test = 1
        bindKeyup();
      }

      //bind keyup function to document keyboard events
      function bindKeyup() {
          angular.element(document).keyup(keyUp);
      }

      //unbind keyup function to document keyboard events
      function unbindKeyup() {
          angular.element(document).unbind('keyup', keyUp);
      }

      //on scope destroy - unbind keyboard watcher
      $scope.$on('$destroy', function () {
          unbindKeyup();
      });

      //move the focus on the num array from element to another
      function keyUp(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        switch(keycode){
          case 72: //h - vim(left 1)
          case 74: //j - vim(down 1)
          case 37: //left
          case 40: //down
            moveHoverIndexLeft();
            break;
          case 76: //l - vim(right 1)
          case 75: //k - vim(up 1)
          case 38: //up          
          case 39: //right
            moveHoverIndexRight();
            break;
          case 13: //enter
            break;
          case 48: //0 move to first element
            self.hoverIndex = 0;
            break;
          case 49: //1
          case 50: //2
          case 51: //3
          case 52: //4
          case 53: //5
            self.hoverIndex = keycode - 49;
            break;
          default:
            break;
        }
      }

      //move focus right
      function moveHoverIndexRight(){
        self.hoverIndex = self.hoverIndex == self.shortcutDemoArray.length - 1 ? 0 : self.hoverIndex + 1;
        console.log(self.hoverIndex)
        self.test++;
      }

      //move focus left
      function moveHoverIndexLeft(){
        self.hoverIndex = self.hoverIndex == 0 ? self.shortcutDemoArray.length - 1 : self.hoverIndex - 1;
        console.log(self.hoverIndex)
      }

      initialize();

    }],
  };
});
