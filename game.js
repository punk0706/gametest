'use strict';

// TODO: remove stateService before launching the game.
angular.module('myApp',
    ['myApp.messageService', 'myApp.gameLogic', 'myApp.scaleBodyService',
     'platformApp'])
  .controller('Ctrl', function (
      $window, $scope, $log,
      messageService, scaleBodyService, stateService, gameLogic) {

    var isLocalTesting = $window.parent === $window;

    function updateUI(params) {
      $scope.jsonState = angular.toJson(params.stateAfterMove, true);
      $scope.board = params.stateAfterMove.board;
      if ($scope.board === undefined) {
        $scope.board = [['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		           		['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];
      }
    	$scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        $scope.turnIndex = params.turnIndexAfterMove;
    }
    updateUI({stateAfterMove: {}});
    var game = {
      gameDeveloperEmail: "punk0706@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles()
    };
    function sendMakeMove(move) {
      $log.info(["Making move:", move]);
      if (isLocalTesting) {
        stateService.makeMove(move);
      } else {
        messageService.sendMessage({makeMove: move});
      }
      if('endMatch' in move[0]){
				var score = move[0].endMatch.endMatchScores;
				if(score[0] > score[1]){
					$window.document.getElementById("gamemsg").innerHTML = "Game over, Black Wins";
				}
				else if(score[0] < score[1]){
					$window.document.getElementById("gamemsg").innerHTML = "Game over, White Wins";
				}
				else{
					$window.document.getElementById("gamemsg").innerHTML = "Game over, Ties";
				}
				setTimeout(function(){$window.document.getElementById("alertbox").style.display = "block";}, 1000);
			}
    }
    $scope.placeDot  = function(str){
    if(str ===''){
    	return 'img/empty.png';
    }
    if(str === 'X'){
    	return 'img/blackStone.png';
    }
    if(str === 'O'){
    	return 'img/whiteStone.png'
    }
    }
    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      if (!$scope.isYourTurn) {
        return;
      }
      try {
        var move = gameLogic.createMove($scope.board, row, col, $scope.turnIndex);
        $scope.isYourTurn = false; // to prevent making another move
        // TODO: show animations and only then send makeMove.
        sendMakeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col]);
        return;
      }
    };
    
	scaleBodyService.scaleBody({width: 1200, height: 1200});
    if (isLocalTesting) {
      game.isMoveOk = gameLogic.isMoveOk;
      game.updateUI = updateUI;
      stateService.setGame(game);
    } else {
      messageService.addMessageListener(function (message) {
        if (message.isMoveOk !== undefined) {
          var isMoveOkResult = gameLogic.isMoveOk(message.isMoveOk);
          messageService.sendMessage({isMoveOkResult: isMoveOkResult});
        } else if (message.updateUI !== undefined) {
          updateUI(message.updateUI);
        }
      });

      messageService.sendMessage({gameReady : game});
    }
  });
