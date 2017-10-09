var app = angular.module('nameGame', ['ngMaterial']);


app.controller('controller', function(dataService, enumerations) {
	var self = this;

	self.dataLoaded = false;
	var loadData = dataService.loadData();
	loadData.then(function(){
		self.dataLoaded = true;
	});
});


