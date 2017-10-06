
window.app.service('dataService', function(dataFactory, $q) {
  var self = this;
  var people = null;

  //Retrieve and set data on service. 
  self.loadData = function() {
    
    var deffered = $q.defer();
    var promise = dataFactory.loadWotPeople();

    promise.then(function(data){
      people = data;
      deffered.resolve();
    }, function(){
      deffered.reject();
    });

    return deffered.promise;
  }

  self.getActiveWotPeopleWithImage = function(){
    return people.filter(activeWithPictureFilter);
  }

  self.getActiveMatWithImage = function(){
    return people.filter(activeWithPictureFilter).filter(matFilter);
  }

  function activeWithPictureFilter(person){
    //filter out all users who don't have a listed job title
    //some users in the list dont contain a headshot url, and some contain a placeholder image. filter out both.
    return person.jobTitle != null && person.headshot != null && person.headshot.url != null && person.headshot.alt != "WillowTree default article featured image";
  }

  function matFilter(person){
    //filter out all users whose first names don't start with mat* - accounts for Mat, Mat, Mathrew, Mathias..etc
    return person.firstName.substring(0,3).toLowerCase() == "mat";
  }

});

