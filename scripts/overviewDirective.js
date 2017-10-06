
window.app.directive('overviewDirective', function() {
  return {
    scope: {},
    templateUrl: '/views/overview.html',
    controllerAs: 'oCtrl',
    controller: function($rootScope, $scope) {
      var self = this;

      self.hoverIndex = 2;
      self.numArray = [1,2,3,4,5];

      //bind keyup function to document keyboard events
      function bindKeyup() {
          angular.element(document).keyup(keyUp);
      }
      bindKeyup();

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
        self.hoverIndex = self.hoverIndex == self.numArray.length - 1 ? 0 : self.hoverIndex + 1;
        console.log(self.hoverIndex)
      }

      //move focus left
      function moveHoverIndexLeft(){
        self.hoverIndex = self.hoverIndex == 0 ? self.numArray.length - 1 : self.hoverIndex - 1;
        console.log(self.hoverIndex)
      }

    },
  };
});
