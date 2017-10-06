var enumerations = {};

window.app.factory('enumerations', [
function () {

  var enums = {
    gameModes: {
        FreePlay: {value: 0, description: 'Free play'},
        Timed: {value: 1, description: 'timed'},
        Mat: {value: 2, description: 'Mat(t)'},
      }

  	}
  	enumerations = angular.extend(enumerations, enums);
	return enumerations
}]);