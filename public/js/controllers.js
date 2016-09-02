var weinerControllers = angular.module('weinerControllers', []);

/* FACTORIES */
weinerControllers.run(['$rootScope', '$http', '$firebaseArray', '$state', '$firebaseAuth', function($rootScope, $http, $firebaseArray, $state, $firebaseAuth) {
	//Set body class no-touch if not touchscreen
	if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
		$rootScope.touch = "no-touch";
	}

	//initialise menu closed
	$rootScope.menuOpen = false;

	//offline db bootstrap
	/*var data;
	$http.get("/weinerfever.json").then(function (response) {
		data = response.data;
		$rootScope.games = data.games;
		$rootScope.teams = data.teams;
	});*/

	//returns gender of the game
	$rootScope.getGender = function (name) {
		if (name.substring(0, 4).toLowerCase() == "boys") {
			return "boys";
		} else {
			return "girls";
		}
	};

	//ordinal function - returns ordinal for the inputted int
	$rootScope.ordinal = function (input) {
		var s=["th","st","nd","rd"],
		v=input%100;
		return s[(v-20)%10]||s[v]||s[0];
	};

	//firebase auth handles on routes
	$rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
		if (error === "AUTH_REQUIRED") {
			$state.go("adminLogin");
		}
	});

	//Static team data
	$http.get("/js/data/teams.json").then(function (response) {
		$rootScope.teamsData = response.data.teams;
	});
	//$rootScope.teamData = teamsJsObject;

	//Makes firebase refs available
	$rootScope.rootRef = new Firebase('https://weinerfever.firebaseio.com/');

	$rootScope.teamsRef = new Firebase("https://weinerfever.firebaseio.com/teams");

	$rootScope.gamesRef = new Firebase("https://weinerfever.firebaseio.com/games");

	$rootScope.statsRef = new Firebase("https://weinerfever.firebaseio.com/stats");

	//auth stuff
	$rootScope.auth = $firebaseAuth($rootScope.rootRef);
}]);

/* DATA FACTORIES */
weinerControllers.factory('teamsObject', ['$firebaseObject', '$rootScope', function($firebaseObject, $rootScope) {
	return {dynamic: $firebaseObject($rootScope.teamsRef.orderByKey()), static: $rootScope.teamsData};
}]);

/*weinerControllers.factory('teamsList', ['$firebaseObject', '$rootScope', function($firebaseObject, $rootScope) {
	var gamesQuery = $rootScope.gamesRef.orderByChild('index');
	return [$firebaseArray(teamsQuery), $firebaseObject(gamesQuery)];
}]);*/

weinerControllers.factory('stats', ['$firebaseObject', '$rootScope', function($firebaseObject, $rootScope) {
	return $firebaseObject($rootScope.statsRef.orderByKey());
}]);


/*CONTROLLERS*/
weinerControllers.controller('home', ['$scope', '$rootScope', '$firebaseArray', 'teamsObject', 'stats', function($scope, $rootScope, $firebaseArray, teamsObject, stats) {
	$scope.liveGames = $firebaseArray($rootScope.gamesRef.orderByChild("live").equalTo(true));
	$scope.otherGames = $firebaseArray($rootScope.gamesRef.orderByChild("live").equalTo(false));
	$scope.teams = teamsObject;
	$scope.stats = stats;
	
	//second games panel:
	//	panelTwoTitle: either upcoming, recent, or other - 	depending on time
	//	otherGameDay: which day's games should be put on the list
	var date = new Date();
	if (date < new Date("December 7, 2016 00:00:00")) {
		$scope.panelTwoTitle = "Upcoming Games";
		$scope.otherGameDay = 7;
	} else if (date > new Date("December 10, 2016 00:00:00")) {
		$scope.panelTwoTitle = "Recent Games";
		$scope.otherGameDay = 10;
	} else {
		$scope.panelTwoTitle = "Other Games Today";
		$scope.otherGameDay = date.getDate();
	}

	$scope.now = new Date();

	$scope.whichStats = null;
	$scope.openStats = function(event) {
		event.stopPropagation();
		if (event.currentTarget != $scope.whichStats) {
			$(".stats").slideUp(350);
			$(event.currentTarget).parents(".game-out-wrap").siblings(".stats").slideDown(350);
			$scope.whichStats = event.currentTarget;
		} else {
			$(event.currentTarget).parents(".game-out-wrap").siblings(".stats").slideUp(350);
			$scope.whichStats = null;
		}
	};
}]);

weinerControllers.controller('games', ['$scope', '$rootScope', '$firebaseArray', 'teamsObject', function ($scope, $rootScope, $firebaseArray, teamsObject) {
	$scope.games = {
		boys: $firebaseArray($rootScope.gamesRef.orderByChild("name").startAt("Boys")),
		girls: $firebaseArray($rootScope.gamesRef.orderByChild("name").startAt("Girls"))
	};
	$scope.teams = teamsObject;
}]);

weinerControllers.controller('teams', ['$scope', function($scope) {
	$scope.message = "teams page";
}]);

weinerControllers.controller('adminLogin', ['$scope', 'currentAuth', '$firebaseAuth', '$rootScope', '$state', function($scope, currentAuth, $firebaseAuth, $rootScope, $state) {
	if (currentAuth !== null) {
		$state.go('adminDash');
	}
	$scope.disabled = false;
	
	$scope.logIn = function () {
		$scope.disabled = true;
		//$scope.entry = $scope.email + "   " + $scope.password;
		
		$rootScope.auth.$authWithPassword({
			email: $scope.email,
			password: $scope.password
		}).then(function (authData) {
			$state.go('adminDash');
		}).catch(function (error) {
			 alert("We\'re sorry, an error has occurred.\n" + error);
			 $scope.disabled = false;
		});

		$scope.email = null;
		$scope.password = null;
	}
}]);

weinerControllers.controller('adminDash', ['$scope', '$firebaseArray', 'currentAuth', '$rootScope', '$state', function($scope, $firebaseArray, currentAuth, $rootScope, $state) {
	$scope.games = $firebaseArray($rootScope.gamesRef.orderByChild("index"));

	//logout of Firebase method
	$scope.logout = function () {
		$rootScope.auth.$unauth();
		$state.go('adminLogin');
	};
}]);

weinerControllers.controller('gameEditorBoth', ['$scope', '$firebaseObject', 'currentAuth', '$rootScope', '$state', '$stateParams', 'teamsObject', '$interval', '$timeout', function($scope, $firebaseObject, currentAuth, $rootScope, $state, $stateParams, teamsObject, $interval, $timeout) {
	$scope.$on('$viewContentLoaded', function (event) {
		size();
	});

	if ($state.current.name == "gameEditorBoth") {
		$scope.both = true;
	} else {
		$scope.both = false;
	}

	$scope.game = $firebaseObject($rootScope.gamesRef.child($stateParams.gameCode));
	$scope.teams = teamsObject;

	$scope.selectedPlayer = "None Selected";
	$scope.selectedTeam = null;
	$scope.color = "rgba(96, 96, 96, 0.7)";
	$scope.logo = null;
	$scope.select = function (event) {
		event.stopPropagation();

		if ($(event.currentTarget).children("td:last-child").text() != $scope.selectedPlayer) {
			$(".roster tr").removeClass('info');
			$(event.currentTarget).addClass('info');
			$scope.selectedPlayer = $(event.currentTarget).children("td:last-of-type").text();
			$scope.selectedTeam = $(event.currentTarget).parents("#table-wrap").prev("h2").text();
			$scope.color = $scope.teams.static[$scope.selectedTeam].color;
			$scope.logo = $scope.teams.static[$scope.selectedTeam].picture;
		} else {
			$(".roster tr").removeClass('info');
			$scope.selectedPlayer = "None Selected";
			$scope.selectedTeam = null;
			$scope.color = "rgba(96, 96, 96, 0.7)";
			$scope.logo = null;
		}
	};

	//var gameStatsRef = null;
	$scope.whichTeam = function () {
		if ($scope.selectedTeam == $scope.game.home) {
			return "home";
		}
		return "away";
	};
	var player = null;
	//operation: + or -    type: key of player's stats object     val: how many points or foul
	$scope.statsEdit = function (event, operation, type, val) {
		//gameStatsRef = $rootScope.gamesRef.child($scope.game.$id + "/stats/" + $scope.whichTeam() + "/");
		if ($scope.selectedPlayer == "None Selected" || !$scope.selectedPlayer) {
			return;
		}

		player = $scope.game.stats[$scope.whichTeam()][$scope.selectedPlayer];
		switch (operation) {
			case "plus":
				if (angular.isNumber(val)) {
					player.pt += val;
					player[type] += val;
					$scope.game.$save();
				} else {
					player.fo ++;
					$scope.game.$save();
				}
				break;
			case "minus":
				if (angular.isNumber(val) && player[type] > 0) {
					player.pt -= val;
					player[type] -= val;
					$scope.game.$save();
				} else if (player.fo > 0) {
					player.fo --;
					$scope.game.$save();
				}
				break;
		}

		$(event.currentTarget).blur();
	};

	//manual-time
	/*$scope.changeQuarterPrompt = function (event) {
		event.preventDefault();
	};*/

	var currentInput, inputLength, timeString;
	$scope.processing = false;
	$scope.keyRegister = function (event) {
		if (event.keyCode == 38 || event.keyCode == 40) {
			return;
		} else if (event.keyCode == 13) {
			$("min").focus();
			return;
		}
		$scope.endTimer();
		currentInput = $(event.target).attr('id');
		inputLength = $(event.target).val().length;
		//console.log($scope.min + "   " + $scope.sec + "   " + $scope.mms);

		if (inputLength > 2 || currentInput == "min" && inputLength > 1) {
			$(event.target).val(substr(currentNumInput-2, 2));
		} else if (inputLength == 2 || currentInput == "min" && inputLength == 1) {
			switch (currentInput) {
				case "min":
					$("#sec").focus();
					break;
				case "sec":
					$("#mms").focus();
					break;
				case "mms":
					$("#manual-time form button[type= 'submit']").focus();
					break;
				default:
					console.log('Error in time form processing.');
					break;
			}
		}
	};

	var timer, flash;
	var setTimer = function () {
		timer = $timeout(function () {
			flash = $interval(function () {
				$("#manual-time table input, #manual-time button#submit").toggleClass('flash');
				console.log('toggle');
			}, 680);
		}, 20000 /*DEV-ONLY:5000*/); 
	};

	$scope.endTimer = function () {
		$interval.cancel(flash);
		$timeout.cancel(timer);
		$("#manual-time table input, #manual-time button#submit").removeClass('flash');
	};

	$scope.quarter = "1";
	$scope.submitForm = function (event) {
		event.preventDefault();
		$scope.processing = true;
		timeString = "";

		$scope.endTimer();		
		
		if (!$scope.sec) {
			$scope.sec = 0;
		}

		if (!$scope.min && !$scope.mms) {
			alert("Either minutes or milliseconds must be 0.");
			$scope.sec = null;
			$scope.processing = false;
			return;
		}

		if ($scope.min >= 10) {
			alert("Minutes must be less than 10.");
			$scope.processing = false;
			return;
		}
		if ($scope.sec >= 60) {
			alert("Seconds must be less than 60.");
			$scope.processing = false;
			return;
		}
		if ($scope.mms >= 100) {
			alert("Milliseconds must be less than 100.");
			$scope.processing = false;
			return;
		}


		if (!$scope.min || $scope.min <= 0) {
			if ($scope.sec < 10) {
				timeString += "0";
			}
			timeString += $scope.sec + ".";
			if ($scope.sec < 10) {
				timeString += "0"
			}
			timeString += $scope.mms;
			
		} else {
			timeString += $scope.min + ":";
			if ($scope.sec < 10) {
				timeString += "0";
			}
			timeString += $scope.sec;
		}

		$scope.game.playTime = timeString;
		$scope.game.$save().then(function () {
			$scope.processing = false;
			$scope.min = null;
			$scope.sec = null;
			$scope.mms = null;
		}, function (error) {
			alert("An error occurred while syncing the play time with the database.\nHere is the error info:\n" + error);
			$scope.processing = false;
		});
		$("#min").focus();
		if (timeString != "7:00") {
			setTimer();
		}
	};
}]);

weinerControllers.controller('gameEditorTime', ['$scope', '$rootScope', '$firebaseObject', 'currentAuth', '$stateParams', function ($scope, $rootScope, $firebaseObject, currentAuth, $stateParams) {
	$scope.game = $firebaseObject($rootScope.gamesRef.child($stateParams.gameCode));
	console.log($scope.game);

	var currentQ;
	$scope.processQuarter = function () {
		currentQ = $scope.game.quarter;
		if (currentQ >= 1 && currentQ <= 4) {
			return currentQ + "<sup>" + $rootScope.ordinal(currentQ) + "</sup> Quarter";
		} else if (currentQ === false) {
			return "Game Over";
		} else if (currentQ == 0) {
			return "Pre-Game";
		} else if (angular.isString(currentQ) && currentQ.toLowerCase().substr(0, 2) == 'ot' && (parseInt(currentQ.charAt(2)) == 1 || parseInt(currentQ.charAt(2)) == 2)) {
			return parseInt(currentQ.charAt(2)) + "<sup>" + $rootScope.ordinal(parseInt(currentQ.charAt(2))) + "</sup> Half Over Time";
		}
	};
}]);
