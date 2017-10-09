
window.app.factory('dataFactory', function() {
  return {
    //Retrieve and set data on service. 
    loadWotPeople: function() {
	    var promise = $.ajax({
	        url: 'https://willowtreeapps.com/api/v1.0/profiles/'});

    return promise;
    }
  }
});

