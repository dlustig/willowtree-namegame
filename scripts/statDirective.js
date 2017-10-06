window.app.directive('statDirective', function(reviewService, dataService, enumerations) {
  return {
    scope: {},
    templateUrl: '/views/stats.html',
    controllerAs: 'sCtrl',
    controller: function($rootScope, $scope) {
      var self = this;
      self.wonStats = null;
      self.failStats = null;

      function initialize(){
        self.rounds = reviewService.getRounds();

        calculateFailedRoundsStats();
        calculateWonRoundsStats();

        console.log(self.rounds);
      }

      function calculateFailedRoundsStats(){
        //filter to only the failed rounds
        var failedRounds = self.rounds.filter(function(round){ return round.failed; });

        //retrieve elapsed time
        var times = failedRounds.map(function(round){return round.elapsedTime; });

        //sort fastest to slowest to easily get the fastest/slowest data
        times = quickSort(times, 0, times.length - 1);

        //retrieve all the personIds from the failed rounds
        var failedRoundsPersonIds = failedRounds.map(function(round){ return round.person.id; });

        //sort the personIds low to high
        failedRoundsPersonIds = quickSort(failedRoundsPersonIds, 0, failedRoundsPersonIds.length - 1);

        var calculatedFailedRounds = [];

        //loop through failedRoundsPersonIds - on each iteration a series of elements will be removed. eventually the array will be empty and the while loop will end
        while(failedRoundsPersonIds.length > 0){
          var currentId = failedRoundsPersonIds[0];
          var count = 1;

          //loop through failedRoundsPersonIds until the next id doesn't match our currentid
          for (var y = 1; y < failedRoundsPersonIds.length; y++){
            var nextId = failedRoundsPersonIds[y];
            if (currentId != nextId){
              break;
            }
            count++;
          }

          //create the stat and add it to the array
          var stat = {
            attempts: count,
            personId: currentId,
            person: failedRounds.filter(function(round){ return round.person.id == currentId;})[0].person
          }

          calculatedFailedRounds.push(stat);

          //remove the items from failedRoundsPersonIds that were just iterated over. Will eventually cause while loop to end
          failedRoundsPersonIds = failedRoundsPersonIds.slice(count);
        }
        console.log(failedRounds.map(function(round){return round.people; }).map(function(person){return person.hintDisplayed; }).filter(function(x){ return x != null; }))
        self.failStats = {
          total: failedRounds.length,
          totalFreeplay: failedRounds.filter(function(round){ return round.gameMode == enumerations.gameModes.FreePlay; }).length, //filter to only free play rounds
          totalTimed: failedRounds.filter(function(round){ return round.gameMode == enumerations.gameModes.Timed; }).length, //filter to only timed rounds
          totalMat: failedRounds.filter(function(round){ return round.gameMode == enumerations.gameModes.Mat; }).length, //filter to only mat(t) rounds
          averageTime: times.length > 0 ? (times.reduce(function(a,b){ return a + b; }) / times.length).toFixed(2) : 0, //calculate average of all times and then round to 2nd decimal
          fastestTime: times[0], //first item in array is fastest after sorting
          slowestTime: times[times.length - 1], //last item in array is slowest after sorting
          rounds: calculatedFailedRounds, //condensed rounds cotaining extended stats (attempts, person)
          hintsApplied: failedRounds.map(function(round){return round.people; }).map(function(person){return person.hintDisplayed; }).filter(function(x){ return x != null; }).length //map rounds to people, map people to hint displayed, filter final array to only include non-null objects
        };
      }


      function calculateWonRoundsStats(){
        //filter out rounds that failed
        var wonRounds = self.rounds.filter(function(round){ return !round.failed; }); 
        
        //retrieve elapsed time
        var times = wonRounds.map(function(round){return round.elapsedTime; }); 

        //sort fastest to slowest to easily get the fastest/slowest data
        times = quickSort(times, 0, times.length - 1);
        self.wonStats = {
          total: wonRounds.length,
          totalFreeplay: wonRounds.filter(function(round){ return round.gameMode == enumerations.gameModes.FreePlay; }).length, //filter to only free play rounds
          totalTimed: wonRounds.filter(function(round){ return round.gameMode == enumerations.gameModes.Timed; }).length, //filter to only timed rounds
          totalMat: wonRounds.filter(function(round){ return round.gameMode == enumerations.gameModes.Mat; }).length, //filter to only mat(t) rounds
          averageTime: times.length > 0 ? (times.reduce(function(a,b){ return a + b; }) / times.length).toFixed(2) : 0, //calculate average of all times and then round to 2nd decimal
          fastestTime: times[0], //first item in array is fastest after sorting
          slowestTime: times[times.length - 1], //last item in array is slowest after sorting
          hintsApplied: wonRounds.map(function(round){return round.people; }).map(function(person){return person.hintDisplayed; }).filter(function(x){ return x != null; }).length //map rounds to people, map people to hint displayed, filter final array to only include non-null objects
        };

      }

      //#region quicksort

      //generic quick sort function - pulled from - http://khan4019.github.io/front-end-Interview-Questions/sort.html#quickSort
      function quickSort(arr, left, right){
         var len = arr.length, pivot, partitionIndex;

        if(left < right){
          pivot = right;
          partitionIndex = partition(arr, pivot, left, right);
          
          //sort left and right
          quickSort(arr, left, partitionIndex - 1);
          quickSort(arr, partitionIndex + 1, right);
        }
        return arr;
      }

      function partition(arr, pivot, left, right){
        var pivotValue = arr[pivot], partitionIndex = left;

        for(var i = left; i < right; i++){
          if(arr[i] < pivotValue){
            swap(arr, i, partitionIndex);
            partitionIndex++;
          }
        }
        swap(arr, right, partitionIndex);
        return partitionIndex;
      }

      function swap(arr, i, j){
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }

      //#endregion

      initialize();

    },
  };
});
