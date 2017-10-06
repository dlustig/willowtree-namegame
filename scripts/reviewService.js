
window.app.service('reviewService', function() {
  var self = this;
  var rounds = [];

  self.addRound = function(person, round, incorrectGuesses, elapsedTime, gameMode){
    var obj = {
      person: person,
      people: round,
      incorrectGuesses: incorrectGuesses,
      elapsedTime: elapsedTime,
      failed: incorrectGuesses > 0,
      gameMode: gameMode
    };
    rounds.push(obj);
    console.log(rounds)
  }

  self.getRounds = function(){
    return rounds;
  }

});

