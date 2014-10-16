'use strict';
angular.module('myApp', ['ngTouch','ngDragDrop','myApp.aiService'])
  .controller('Ctrl', function (
      $window, $scope, $log, $timeout,
      aiService, gameService, scaleBodyService, gameLogic) {
       var moveAudio = new Audio('audio/move.wav');
    moveAudio.load();
    function updateUI(params) {
      $scope.board = params.stateAfterMove.board;
      $scope.delta = params.stateAfterMove.delta;
      if ($scope.board === undefined) {
      	$scope.numOfMoves = 0;
      	$scope.isAiWorking = false;
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
      } else {
        // Only play a sound if there was a move (i.e., state is not empty).
        moveAudio.play();
      }
    	$scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        $scope.turnIndex = params.turnIndexAfterMove;
        if ($scope.isYourTurn && params.yourPlayerIndex === 1) {
        // Wait 500 milliseconds until animation ends.
        	$timeout(sendComputerMove, 600);
      	}
    }
    function sendComputerMove() {
        var aimove = [];
        if($scope.numOfMoves < 2){
        	aimove = firstAIMoveGenerator();
        }
        else{
        	aimove = aiServiceMakeMove();
        }
        $scope.newMove = aimove;
        gameService.makeMove(gameLogic.createMove($scope.board, aimove[0], aimove[1], $scope.turnIndex));
        $scope.isFinished = updateMessage(gameLogic.createMove($scope.board, aimove[0], aimove[1], $scope.turnIndex));
        aiService.informingComputer(aimove[0], aimove[1], 'white');
        $timeout(updateAIStatues, 500);
        $scope.numOfMoves++;
    }
    function updateAIStatues(){
        $scope.isAiWorking = false;
        if (!$scope.isFinished){
        	$window.document.getElementById("gamemsg").innerHTML = "Black's turn";
        }
    }
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
    function iniAiService(){
    	aiService.iniComputer();
    }
    iniAiService();
    function aiServiceMakeMove(){
    	return aiService.getMove();
    }
    function firstAIMoveGenerator(){
    	var moves=[
            [6,6],
            [6,7],
            [6,8],
            [7,6],
            [7,7],
            [7,8],
            [8,6],
            [8,7],
            [8,8]
        ];
        while(true){
            var ind=Math.floor(Math.random()*moves.length);
            if($scope.board[moves[ind][0]][moves[ind][1]] === ''){
                return [(moves[ind][0]),(moves[ind][1])];
            }else{
                moves.splice(ind,1);
            }
        }
    }
    /*
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
    */
    function updateMessage(move){
    if('endMatch' in move[0]){
				var score = move[0].endMatch.endMatchScores;
				if(score[0] > score[1]){
					$window.document.getElementById("gamemsg").innerHTML = "Black Wins";
				}
				else if(score[0] < score[1]){
					$window.document.getElementById("gamemsg").innerHTML = "White Wins";
				}
				else{
					$window.document.getElementById("gamemsg").innerHTML = "Ties";
				}
				$window.document.getElementById("newgamebt").style.display = "block";
				return true;
		};
		return false
    };
    $scope.placeDot  = function(str, row, col){
    if(str ===''){
    	return 'img/empty.png';
    	//return 0;
    }
    if(str === 'X'){
    	if(row === $scope.newMove[0] && col === $scope.newMove[1]){
    		return 'img/newblackStone.png';
    	}
    	return 'img/blackStone.png';
    }
    if(str === 'O'){
    	if(row === $scope.newMove[0] && col === $scope.newMove[1]){
    		return 'img/newwhiteStone.png';
    	}
    	return 'img/whiteStone.png'
    }
    }
    $scope.shouldSlowlyAppear = function (row, col) {
      return $scope.delta !== undefined
          && $scope.delta.row === row && $scope.delta.col === col;
    }
    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      if (!$scope.isYourTurn) {
        return;
      }
      try {
        if(!$scope.isAiWorking){
        $scope.isAiWorking = true;
        var move = gameLogic.createMove($scope.board, row, col, $scope.turnIndex);
        $scope.newMove = [row, col];
        $scope.isYourTurn = false; // to prevent making another move
        gameService.makeMove(move);
        $scope.isFinished = updateMessage(move);
        $scope.numOfMoves++;
        aiService.informingComputer(row, col, 'black');
        if(!$scope.isFinished){
        $window.document.getElementById("gamemsg").innerHTML = "AI thinking...";
        }
        }
        else{
        	return false;
        }
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col]);
        return;
      }
    };
    $scope.onStartCallback = function () {
        $log.info("onStart happened!", arguments);
      };
	scaleBodyService.scaleBody({width: 1200, height: 1200});
    gameService.setGame({
      gameDeveloperEmail: "punk0706@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles(),
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  });
