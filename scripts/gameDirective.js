//Free play directive
//display 5 random tiles at a time, no timer applied
//on initial correct choice, remove tile from active array
//on incorrect choice, increment fail on tile, by number of tiles chosen before correct option. will be retried again later
//to win, guess all names correctly on first try


window.app.directive('gameDirective', function() {
  return {
    templateUrl: '/views/game.html',
    restrict: 'AE',
    scope: true,
    controllerAs: 'fPCtrl',
    bindToController:{
      showHint: "=",
      gameMode: "=",
    },
    controller: ['$rootScope', '$scope', 'enumerations','dataService', 'reviewService', '$timeout', '$q',
    function($rootScope, $scope, enumerations,dataService, reviewService, $timeout, $q) {

      var self = this;
      self.people = [];
      self.currentRound = [];
      self.currentRoundCounter = null;
      self.nextRoundCounter = null;
      self.timedCounter = null;

      function initialize(gameMode){
        //copy data from dataService. We don't want to accidentally set values on our primary array
        switch(gameMode.value){
          case enumerations.gameModes.FreePlay.value:
          case enumerations.gameModes.Timed.value:
            self.people = angular.copy(dataService.getActiveWotPeopleWithImage());
            break;
          case enumerations.gameModes.Mat.value:
            self.people = angular.copy(dataService.getActiveMatWithImage());
            break;
        }

        self.gameModes = enumerations.gameModes;

        console.log(self.people);

        //bind key events
        bindKeyup();

        //start the game
        loadRound();
      }

      //randomize array
      //take first 5 people
      //randomly choose a correct person.
      //start current round counter
      function loadRound(){

        randomizePeople();
        self.currentRound = self.people.slice(0,5);
        self.currentRoundCorrectPerson = self.currentRound[Math.floor(Math.random()*self.currentRound.length)];

        startCurrentRoundCounter();

        if(self.gameMode.value == enumerations.gameModes.Timed.value)
          startTimedRoundTimer();

        if (self.showHint)
          startHintTimer();

        //reset the initial pre-select item
        self.hoverIndex = 0;
      }

      //randomize main person array
      function randomizePeople(){
        self.people.sort(function(a,b){return 0.5 - Math.random()});
      }

      
      //user click event
      //set selected value
      //if the person hasn't been selected already in this current round - match id to the correct id
      //set guess values on person object - used in ng-class/ng-if to show correct/incorrect data
      self.select = function(person){
        if (!person.selected){
        
          person.selected = true;

          if (person.id == self.currentRoundCorrectPerson.id){
            correctGuess(person);
          }else{
            incorrectGuess(person);
          }
        }
      }

      function correctGuess(person){
        person.correctlyGuessed = true;

        stopCurrentRoundCounter();

        if(self.gameMode.value == enumerations.gameModes.Timed.value)
          stopTimedRoundTimer();

        loadNextRound();
      }

      function incorrectGuess(person){
        person.incorrectlyGuessed = true;
        if (!!person.incorrectlyGuessedTimes)
          person.incorrectlyGuessedTimes = 0;

        person.incorrectlyGuessedTimes++;
      }

      //on round completion/correct guess - start the next rounds counter.
      //on counter completion (promise) - reset current round's values and load the next round.
      function loadNextRound(){
        var incorrectGuesses = self.currentRound.filter(function(person){return person.incorrectlyGuessed;}).length;
        reviewService.addRound(self.currentRoundCorrectPerson, angular.copy(self.currentRound), incorrectGuesses, self.currentRoundCounter, self.gameMode);

        var counterPromise = startNextRoundCounter();
        counterPromise.then(function(){
          resetSelectedValues();
          loadRound();
          self.nextRoundCounter = null;
        });

        //if the round was a 'win' then remove the correct person from the array
        if (incorrectGuesses.length == 0)
          removeCorrectGuess();
      }

      //reset the current round's persons to their initial value
      //don't reset stat information
      function resetSelectedValues(){
        angular.forEach(self.currentRound, function(person){
          person.selected = false;
          person.correctlyGuessed = false;
          person.incorrectlyGuessed = false;
          person.hintDisplayed = false;
        });
          self.currentRoundCorrectPerson = null;
      }

      //Remove the correctly guessed person from the main person array
      function removeCorrectGuess(){
        self.people = self.people.filter(function(person){
          return person.id != self.currentRoundCorrectPerson.id;
        });
      }

      //force the nextRoundCounter to 0 - this will short-curcuit the decrimentCounter sub-function in startNextRoundCounter function to return a promise early 
      self.skipToNextRound = function(){
        self.nextRoundCounter = 0;   
      }

      //round failed either because the hint was waited upon, or round timed out.
      //loop through all incorrect people and 'select' them, before 'selecting' the correct person and ending the round
      function setFailedRound(){
        console.log('setFailedRound')
        var correctPerson = null;
        angular.forEach(self.currentRound, function(person){
          if (!person.selected){
            if (person.id == self.currentRoundCorrectPerson.id)
              correctPerson = person;
            else
              self.select(person);
          }
        });

        if(!!correctPerson)
          self.select(correctPerson);
      }



      //#region counter

      var currentRoundTimer = null;
      function startCurrentRoundCounter(){
        self.currentRoundCounter = 0;
        var incrementCounter = function() {
            self.currentRoundCounter++;

            
            if(self.currentRoundCounter != null)
              currentRoundTimer = $timeout(incrementCounter, 1000);
            else{
              $timeout.cancel(currentRoundTimer);   
            }
        };
        incrementCounter();       
      }

      //stop the currentRound timeout
      function stopCurrentRoundCounter(){
        if(currentRoundTimer)
          $timeout.cancel(currentRoundTimer);   
      }

      //display a hint ever 3000 seconds
      var hintTimer = null;
      function startHintTimer(){
        if (hintTimer != null)
          clearInterval(hintTimer);

        hintTimer = setInterval(displayHint, 3000)
      }

      function stopHintTimer(){
        if (hintTimer)
          clearInterval(hintTimer);
      }

      //Counter starts at 5, returns a promise when it hits 0
      var nextRoundTimer = null;
      function startNextRoundCounter(){
        self.nextRoundCounter = 10;

        var deferred = $q.defer();

        var decrimentCounter = function() {
            self.nextRoundCounter--;

            if (self.nextRoundCounter > 0)
              nextRoundTimer = $timeout(decrimentCounter, 1000);
            else{
              $timeout.cancel(nextRoundTimer);   
              deferred.resolve();
            }
        };
        decrimentCounter();        
        
        return deferred.promise;
      }

      function stopNextRoundTimer(){
        if (nextRoundTimer)
          $timeout.cancel(nextRoundTimer);   
      }

      var timedRoundTimer = null;
      function startTimedRoundTimer(){
        self.timedCounter = 10;

        var decrimentCounter = function() {
            self.timedCounter--;

            if (self.timedCounter > 0)
              timedRoundTimer = $timeout(decrimentCounter, 1000);
            else{
              //round failed
              $timeout.cancel(timedRoundTimer);  

              setFailedRound(); 
            }
        };
        decrimentCounter();        
              }

      //stop the currentRound timeout
      function stopTimedRoundTimer(){
        if (timedRoundTimer)
          $timeout.cancel(timedRoundTimer);   
      }
      //#endregion


      //every few seconds (set by user) display one of the incorrect people who has not been selected yet.
      function displayHint(){
        //get all the users who have not been selected in the current round, and are not the correct user
        var unselectedIncorrectPeople = self.currentRound.filter(
          function(person)
          { 
            if (person.id != self.currentRoundCorrectPerson.id && !person.selected && !!person)
             return person
          });

        if (unselectedIncorrectPeople.length > 0){
        //choose one randomly (or only) and display hint
        var personToHint = unselectedIncorrectPeople.length == 0 ?
         unselectedIncorrectPeople.first() : unselectedIncorrectPeople[Math.floor(Math.random()*unselectedIncorrectPeople.length)];
        if (!!personToHint)
        {
          personToHint.selected = true;
          personToHint.hintDisplayed = true;
        }
      }
      }



      //#region keypress listener


      function bindKeyup() {
        angular.element(document).keyup(keyUp);
      }

      function unbindKeyup() {
        angular.element(document).unbind('keyup', keyUp);
      }

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
            self.select(self.currentRound[self.hoverIndex]);
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
            self.select(self.currentRound[self.hoverIndex]);
            break;
          default:
            break;
        }
      }

      function moveHoverIndexRight(){
        self.hoverIndex = self.hoverIndex == self.currentRound.length - 1 ? 0 : self.hoverIndex + 1;
      }

      function moveHoverIndexLeft(){
        self.hoverIndex = self.hoverIndex == 0 ? self.currentRound.length - 1 : self.hoverIndex - 1;
      }

      //#endregion


      //#region watchers

      //The directive is created before the bound parameters are initialized. Need a watch on the gameMode variable to kick off data initialization
      var gameModeWatcher = $scope.$watch(function () { return self.gameMode; }, function (newVal, oldVal) {
        if (newVal != null && !!newVal){
          initialize(newVal);
        }
      });


      var hintWatcher = $scope.$watch(function () { return self.showHint; }, function (newVal, oldVal) {
        if (newVal != null && !!newVal){
          startHintTimer();
        }else{
          if (hintTimer != null)
            clearInterval(hintTimer);
        }
      });

      //#endregion

      $scope.$on('$destroy', function () {
          unbindKeyup();
          stopTimedRoundTimer();
          stopNextRoundTimer();
          stopHintTimer();
          stopCurrentRoundCounter();
      });

    }],
  };
});
