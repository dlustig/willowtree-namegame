window.app.directive('gameDirective', function() {
  return {
    templateUrl: '/views/game.html',
    restrict: 'AE',
    scope: true,
    controllerAs: 'fPCtrl',
    controller: ['$rootScope', '$scope', 'enumerations','dataService', 'reviewService', '$timeout', '$q',
    function($rootScope, $scope, enumerations,dataService, reviewService, $timeout, $q) {

      var self = this;
      self.people = [];
      self.currentRound = [];
      self.currentRoundCounter = null;
      self.nextRoundCounter = null;
      self.timedCounter = null;
      self.gameMode = enumerations.gameModes.FreePlay;
      self.gameModes = enumerations.gameModes;


      function initialize(){
        //copy data from dataService. We don't want to accidentally set values on our primary array
        switch(self.gameMode.value){
          case enumerations.gameModes.FreePlay.value:
          case enumerations.gameModes.Timed.value:
            self.people = angular.copy(dataService.getActiveWotPeopleWithImage());
            break;
          case enumerations.gameModes.Mat.value:
            self.people = angular.copy(dataService.getActiveMatWithImage());
            break;
        }

        //bind key events
        bindKeyup();

        //start the game
        loadRound();
      }

      function loadRound(){

        //randomize array
        randomizePeople();

        self.currentRound = self.people.slice(0,5);

        //randomly choose a correct person.
        self.currentRoundCorrectPerson = self.currentRound[Math.floor(Math.random()*self.currentRound.length)];

        //start current round counter
        startCurrentRoundTimer();

        //if timed round - start timer
        if(self.gameMode.value == enumerations.gameModes.Timed.value)
          startTimedRoundTimer();

        //if hint selection is true - start hint timer
        if (self.showHint)
          startHintTimer();

        //reset the initial pre-selected hover item
        self.hoverIndex = 0;
      }

      //randomize main person array
      function randomizePeople(){
        self.people.sort(function(a,b){return 0.5 - Math.random()});
      }

      
      //user click event
      self.select = function(person){
        if (!person.selected){
        
          person.selected = true;
      
          //if the person hasn't been selected already in this current round - match id to the correct id
          //set guess values on person object - used in ng-class/ng-if to show correct/incorrect data
          if (person.id == self.currentRoundCorrectPerson.id){
            correctGuess(person);
          }else{
            incorrectGuess(person);
          }
        }
      }

      //user made the correct guess, doesn't mean the round was a win, just means the rounds is over
      function correctGuess(person){
        person.correctlyGuessed = true;

        //stop applicable timers - currentRound/Timed/hint timers

        stopCurrentRoundTimer();

        if(self.gameMode.value == enumerations.gameModes.Timed.value)
          stopTimedRoundTimer();

        if (self.showHint)
          stopHintTimer();

        loadNextRound();
      }

      function incorrectGuess(person){
        person.incorrectlyGuessed = true;
      }

      //on round completion/correct guess - start the next rounds' counter.
      function loadNextRound(){
        //calculate number of incorrect guesses during current round
        var incorrectGuessesCount = self.currentRound.filter(function(person){ return person.incorrectlyGuessed || person.hintDisplayed;}).length;

        //add round to review service, also used for stats
        reviewService.addRound(self.currentRoundCorrectPerson, angular.copy(self.currentRound), incorrectGuessesCount, self.currentRoundCounter, self.gameMode);

        var counterPromise = startNextRoundCounter();
        counterPromise.then(function(){

          //if the round was a 'win' (no incorrect guesses and didn't wait for hint to display 3 incorrect users) then remove the correct person from the array
          if (incorrectGuessesCount == 0)
            removeCorrectGuess();

          //reset current rounds selected (guessed - correct/incorrect) values
          resetSelectedValues();

          //start next round
          loadRound();
        });
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

      //Remove the correctly guessed person from the main person array - only is called if round is a 'win'
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
      function startCurrentRoundTimer(){
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
      function stopCurrentRoundTimer(){
        if(currentRoundTimer)
          $timeout.cancel(currentRoundTimer);   
      }


      //display a hint every 3 seconds
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


      //Counter starts at 10, returns a promise when it hits 0
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
              self.nextRoundCounter = null;
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


      //every few seconds display one of the incorrect people who has not been selected yet.
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
        else{
          //user waited until the hint displayed the correct choice
          setFailedRound();
        }
      }



      //#region keypress listener

      //bind keyboard keyUp event to the keyUp funtion
      function bindKeyup() {
        angular.element(document).keyup(keyUp);
      }

      //unbind keyUp keyboard event from DOM
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
            forceDigestCycle();
            break;
          case 49: //1
          case 50: //2
          case 51: //3
          case 52: //4
          case 53: //5
            self.hoverIndex = keycode - 49;
            forceDigestCycle();
            self.select(self.currentRound[self.hoverIndex]);
            break;
          default:
            break;
        }
      }

      function moveHoverIndexRight(){
        self.hoverIndex = self.hoverIndex == self.currentRound.length - 1 ? 0 : self.hoverIndex + 1;
        forceDigestCycle();
      }

      function moveHoverIndexLeft(){
        self.hoverIndex = self.hoverIndex == 0 ? self.currentRound.length - 1 : self.hoverIndex - 1;
        forceDigestCycle();
      }

      //There is a noticeable lag when the focus changes programatically while the normal digest loop functions
      //forcing a new digest cycle fixes that lag
      function forceDigestCycle(){
        $scope.$apply();
      }

      //#endregion


      //user selected a new game mode
      self.changeGameMode = function(){
        stopAllTimers();
        initialize(self.gameMode);
      }

      //user flipped show hint boolean
      self.changeShowHint = function(){
        if (self.showHint)
          startHintTimer();
        else
          stopHintTimer();
      }

      function stopAllTimers(){
        stopTimedRoundTimer();
        stopNextRoundTimer();
        stopHintTimer();
        stopCurrentRoundTimer();
      }

      //directive scope has been destroyed by navigating to a different tab. Remove active timers and unbind key events
      $scope.$on('$destroy', function () {
        stopAllTimers();
        unbindKeyup();
      });



      initialize();

    }],
  };
});
