var weinerControllers = angular.module('weinerControllers', []);

/* FACTORIES */
weinerControllers.run(['$rootScope', '$http', '$firebaseArray', '$state', '$firebaseAuth', '$location', '$window', function($rootScope, $http, $firebaseArray, $state, $firebaseAuth, $location, $window) {
	//analytics
	$window.ga('create', 'UA-86786641-1', 'auto');
	$rootScope.$on('$stateChangeSuccess', function (event) {
		$window.ga('send', 'pageview', $location.path());
	});
 

	//Set body class no-touch if not touchscreen
	if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
		$rootScope.touch = "no-touch";
	}
	//detect if ios or android
	$rootScope.ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	$rootScope.android = /android/i.test(navigator.userAgent);

	//initialise menu closed
	//$rootScope.menuOpen = true;
	$rootScope.menuOpen = false;

	//list of broadcasters
	$rootScope.broadcasters = [
		{name: "Andrew A", grade: "\'17"},
		{name: "Sholom A", grade: "\'18"},
		{name: "Josh S", grade: "\'17"},
		{name: "Ben S", grade: "\'17"},
		{name: "Jonathan O", grade: "\'17"},
		{name: "Jacob Z", grade: "\'17"},
		{name: "Mitchell J", grade: "\'18"},
		{name: "Ezra S", grade: "\'18"},
		{name: "Betzalel M", grade: "\'18"},
		{name: "Alex R", grade: "\'18"},
		{name: "Yonathan M", grade: "\'18"},
		{name: "Ben S", grade: "\'18"},
		{name: "Jeremy G", grade: "\'19"},
		{name: "Josh S", grade: "\'19"},
		{name: "Jordan K", grade: "\'18"},
		{name: "Howard S", grade: "\'18"},
		{name: "Samantha W", grade: "\'18"},
		{name: "Yisroel A", grade: "\'20"},
		{name: "Daniel B", grade: "\'17"},
		{name: "George S", grade: "\'18"},
		{name: "Tyler S", grade: "\'20"}
	];

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

	//for displaying the human-readable quarter for live games (1st quarter, ect.)
	$rootScope.displayQuarter = function (num) {
		if (num >= 1 && num <= 4) {
			return num + "<sup>" + $rootScope.ordinal(num) + "</sup> Quarter";
		} else if (angular.isString(num) && num.toLowerCase().substr(0, 2) == 'ot' && (parseInt(num.charAt(2)) == 1 || parseInt(num.charAt(2)) == 2)) {
			return parseInt(num.charAt(2)) + "<sup>" + $rootScope.ordinal(parseInt(num.charAt(2))) + "</sup> Half Over Time";
		}
	};

	//for managing stats buttons on / and /games
	$rootScope.whichStats = null;
	$rootScope.openStats = function(event) {
		event.stopPropagation();
		if (event.currentTarget != $rootScope.whichStats) {
			$(".stats").slideUp(350);
			$(event.currentTarget).parents(".game-out-wrap").siblings(".stats").slideDown(350);
			$rootScope.whichStats = event.currentTarget;
		} else {
			$(event.currentTarget).parents(".game-out-wrap").siblings(".stats").slideUp(350);
			$rootScope.whichStats = null;
		}
	};

	//for manual time forms
	var currentInput, inputLength, timeString;
	$rootScope.processing = false;
	$rootScope.keyRegister = function (event) {
		if (event.keyCode == 38 || event.keyCode == 40) {
			return;
		} else if (event.keyCode == 13) {
			$("min").focus();
			return;
		}
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

	$rootScope.processManualTime = function (min, sec, mms, qtr) {
		timeString = "";

		//always need sec to be something or 0
		if (!sec) {
			sec = 0;
		}

		/*  validate  */
		// must have quarter
		if (!qtr) {
			alert("You must enter a quarter.");
			$rootScope.processing = false;
			return false;
		}

		//can't have mins and milliseconds
		if (!min && !mms) {
			alert("Either minutes or milliseconds must be 0.");
			sec = null;
			$rootScope.processing = false;
			return false;
		}

		//can't have too many minutes, seconds, or milliseconds
		if (min >= 10) {
			alert("Minutes must be less than 10.");
			$rootScope.processing = false;
			return false;
		}
		if (sec >= 60) {
			alert("Seconds must be less than 60.");
			$rootScope.processing = false;
			return false;
		}
		if (mms >= 100) {
			alert("Milliseconds must be less than 100.");
			$rootScope.processing = false;
			return false;
		}

		/*  set timeString  */
		//if no minutes then add sec and mms
		//add leading zeros for sec and mms if they are less than 10
		if (!min || min <= 0) {
			if (sec < 10) {
				timeString += "0";
			}
			timeString += sec + ".";
			if (mms < 10) {
				timeString += "0"
			}
			timeString += mms;
		} else {
			//if minutes add min and sec
			timeString += min + ":";
			if (sec < 10) {
				timeString += "0";
			}
			timeString += sec;
		}

		return [timeString, qtr];
	};


	//firebase auth handles on routes
	$rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
		if (error === "AUTH_REQUIRED") {
			$state.go("adminLogin");
		}
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
	return $firebaseObject($rootScope.teamsRef.orderByKey());
}]);

/*weinerControllers.factory('teamsList', ['$firebaseObject', '$rootScope', function($firebaseObject, $rootScope) {
	var gamesQuery = $rootScope.gamesRef.orderByChild('index');
	return [$firebaseArray(teamsQuery), $firebaseObject(gamesQuery)];
}]);

weinerControllers.factory('stats', ['$firebaseObject', '$rootScope', function($firebaseObject, $rootScope) {
	return $firebaseObject($rootScope.statsRef.orderByKey());
}]);*/


/*CONTROLLERS*/
weinerControllers.controller('home', ['$scope', '$rootScope', '$firebaseArray', 'teamsObject', '$http', function($scope, $rootScope, $firebaseArray, teamsObject, $http) {
	$scope.liveGames = $firebaseArray($rootScope.gamesRef.orderByChild("live").equalTo(true));
	$scope.otherGames = $firebaseArray($rootScope.gamesRef.orderByChild("live").equalTo(false));
	
	$scope.teams = {};
	$http.get("/js/data/teams.json").then(function (response) {
		$scope.teams.static = response.data.teams;
	});
	$scope.teams.dynamic = teamsObject;
	//$scope.stats = stats;
	
	//second games panel:
	//	panelTwoTitle: either upcoming, recent, or other - 	depending on time
	//	otherGameDay: which day's games should be put on the list
	var date = new Date();
	if (date < new Date("November 30, 2016 00:00:00")) {
		$scope.panelTwoTitle = "Upcoming Games";
		$scope.otherGameDay = 30;
	} else if (date > new Date("December 4, 2016 00:00:00")) {
		$scope.panelTwoTitle = "Recent Games";
		$scope.otherGameDay = 3;
	} else {
		$scope.panelTwoTitle = "Today's Games";
		$scope.otherGameDay = date.getDate();
	}

	$scope.now = new Date();

	$rootScope.whichStats = null;
}]);

weinerControllers.controller('games', ['$scope', '$rootScope', '$firebaseArray', 'teamsObject', '$http', function ($scope, $rootScope, $firebaseArray, teamsObject, $http) {
	$scope.games = {
		boys: $firebaseArray($rootScope.gamesRef.orderByChild("name").limitToFirst(20)),
		girls: $firebaseArray($rootScope.gamesRef.orderByChild("name").limitToLast(20))
	};
	$scope.teams = {};
	$http.get("/js/data/teams.json").then(function (response) {
		$scope.teams.static = response.data.teams;
	});
	$scope.teams.dynamic = teamsObject;

	$rootScope.whichStats = null;
}]);

weinerControllers.controller('teams', ['$scope', '$rootScope', 'teamsObject', '$http', function($scope, $rootScope, teamsObject, $http) {
	$scope.teams = {};
	$http.get("/js/data/teams.json").then(function (response) {
		$scope.teams.static = response.data.teams;
	});
	$scope.teams.dynamic = teamsObject;
}]);

weinerControllers.controller('teamsSelected', ['$scope', '$rootScope', 'teamsObject', '$state', '$stateParams', '$http', '$firebaseObject', function($scope, $rootScope, teamsObject, $state, $stateParams, $http, $firebaseObject) {
	if ($stateParams.team == 'TBD') {
		$state.go('home');
	}
	$scope.params = {team: $stateParams.team, gender: $stateParams.gender};
	$scope.teams = {};
	$http.get("/js/data/teams.json").then(function (response) {
		$scope.teams.static = response.data.teams;
	});

	$scope.teams.dynamic = teamsObject;

	$scope.game = {
		stats: {
			boys: $firebaseObject($rootScope.statsRef.child($stateParams.team).child("boys").orderByKey()),
			girls: $firebaseObject($rootScope.statsRef.child($stateParams.team).child("girls").orderByKey()),
		}
	};console.log($scope.game);

	$scope.selection = null;
	$scope.select = function (gender) {
		if (gender == 'boys') {
			if ($scope.selection == 'boys') {
				$scope.selection = null;
			} else {
				$scope.selection = 'boys';
			}
		} else {
			if ($scope.selection == 'girls') {
				$scope.selection = null;
			} else {
				$scope.selection = 'girls';

			}
		}
	};
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

weinerControllers.controller('gameEditorBoth', ['$scope', '$firebaseObject', 'currentAuth', '$rootScope', '$state', '$stateParams', 'teamsObject', '$interval', '$timeout', '$http', function($scope, $firebaseObject, currentAuth, $rootScope, $state, $stateParams, teamsObject, $interval, $timeout, $http) {
	$scope.$on('$viewContentLoaded', function (event) {
		size();
	});

	if ($state.current.name == "gameEditorBoth") {
		$scope.both = true;
	} else {
		$scope.both = false;
	}

	$scope.stats = {};
	$scope.game = $firebaseObject($rootScope.gamesRef.child($stateParams.gameCode));
	$scope.game.$loaded().then(function () {
		$scope.stats.home = $firebaseObject($rootScope.statsRef.child($scope.game.home).child($rootScope.getGender($scope.game.name)));
		$scope.stats.away = $firebaseObject($rootScope.statsRef.child($scope.game.away).child($rootScope.getGender($scope.game.name)));
	});

	$scope.teams = {};
	$http.get("/js/data/teams.json").then(function (response) {
		$scope.teams.static = response.data.teams;
	});
	$scope.teams.dynamic = teamsObject;


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
			$scope.selectedTeam = $scope.selectedTeam.substring(0, ($scope.selectedTeam.length - 4));
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
	var player, stats = null;
	//operation: + or -    type: key of player's stats object     val: how many points or foul
	$scope.statsEdit = function (event, operation, type, val) {
		//gameStatsRef = $rootScope.gamesRef.child($scope.game.$id + "/stats/" + $scope.whichTeam() + "/");
		if ($scope.selectedPlayer == "None Selected" || !$scope.selectedPlayer) {
			return;
		}

		player = $scope.game.stats[$scope.whichTeam()][$scope.selectedPlayer];
		stats = $scope.stats[$scope.whichTeam()][$scope.selectedPlayer];
		switch (operation) {
			case "plus":
				if (angular.isNumber(val)) {
					player.pt += val;
					player[type] ++;
					$scope.game[$scope.whichTeam().charAt(0) + "Score"] += val;
					$scope.game.$save();

					stats.pt += val;
					stats[type] ++;
					$scope.stats[$scope.whichTeam()].$save();
				} else {
					player.fo ++;
					$scope.game.$save();

					stats.fo --;
					$scope.stats[$scope.whichTeam()].$save();
				}
				break;
			case "minus":
				if (angular.isNumber(val) && player[type] > 0) {
					player.pt -= val;
					player[type] -- ;
					$scope.game[$scope.whichTeam().charAt(0) + "Score"] -= val;
					$scope.game.$save();

					stats.pt -= val;
					stats[type] --;
					$scope.stats[$scope.whichTeam()].$save();
				} else if (player.fo > 0) {
					player.fo --;
					$scope.game.$save();

					stats.fo --;
					$scope.stats[$scope.whichTeam()].$save();
				}
				break;
		}

		$(event.currentTarget).blur();
	};

	//manual-time
	/*$scope.changeQuarterPrompt = function (event) {
		event.preventDefault();
	};*/

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

	$scope.submitForm = function (event) {
		event.preventDefault();
		$rootScope.processing = true;
		
		$scope.endTimer();		
		
		var playTime = $rootScope.processManualTime($scope.min, $scope.sec, $scope.mms, $scope.quarter);
		if (!playTime) {
			return;
		}
		$scope.game.playTime = playTime[0];
		$scope.game.quarter = playTime[1];
		if ($scope.game.quarter == 0 || !$scope.game.quarter) {
			//console.log($scope.game.quarter);
			$scope.game.live = false;
		} else {
			$scope.game.live = true;
		}
		//console.log($scope.game.playTime);
		$scope.game.$save().then(function () {
			$rootScope.processing = false;
			$scope.min = null;
			$scope.sec = null;
			$scope.mms = null;
		}, function (error) {
			alert("An error occurred while syncing the play time with the database.\nHere is the error info:\n" + error);
			$rootScope.processing = false;
		});
		
		$("#min").focus();
		if ($scope.game.playTime != "7:00") {
			setTimer();
		}
	};
}]);

weinerControllers.controller('gameEditorTime', ['$scope', '$rootScope', '$firebaseObject', 'currentAuth', '$stateParams', '$state', function ($scope, $rootScope, $firebaseObject, currentAuth, $stateParams, $state) {
	$scope.game = $firebaseObject($rootScope.gamesRef.child($stateParams.gameCode));
	//console.log($scope.game);

	var currentQuarter;
	$scope.processQuarter = function () {
		currentQuarter = $scope.game.quarter;
		if (currentQuarter >= 1 && currentQuarter <= 4) {
			return currentQuarter + "<sup>" + $rootScope.ordinal(currentQuarter) + "</sup> Quarter";
		} else if (currentQuarter === false) {
			return "Game Over";
		} else if (currentQuarter == 0) {
			return "Pre-Game";
		} else if (angular.isString(currentQuarter) && currentQuarter.toLowerCase().substr(0, 2) == 'ot' && (parseInt(currentQuarter.charAt(2)) == 1 || parseInt(currentQuarter.charAt(2)) == 2)) {
			return parseInt(currentQuarter.charAt(2)) + "<sup>" + $rootScope.ordinal(parseInt(currentQuarter.charAt(2))) + "</sup> Half Over Time";
		}
	};

	$scope.env = {
		quarterLength:/* "7:00"*/ "35.20",
		otQLength: "32.68"
	};

	//button and quarter logic:
	$scope.button = {
		text: "Start 1<sup>st</sup> Quarter",
		context: "primary",
		/*
			states:
				0:  start-game
				1:  start quarter
				2:  pause
				3:  resume
				4:  verify quarter
				5:  verify game (end)
				6:  verify game (continue to ot)
				7:  start ot #1
				8:  verify ot #1 (end)
				9:  verify ot #1 (continue)
				10: start ot #2
				11: verify ot #2
		*/
		state: 0
	};

	$scope.buttonClick = function (event) {
		event.preventDefault();
		$(event.currentTarget).blur();
		//console.log($scope.button.state);

		//currentQuarter = $scope.game.quarter;
		if ($scope.button.state === 0) {
			$scope.game.live = true;
			$scope.game.quarter = 1;
			initClock($scope.env.quarterLength, 1);
			clock.start();
			$scope.game.$save();
			$scope.button.state = 2;
			$scope.button.text = "Pause";
			$scope.button.context = "warning";
		} else if ($scope.button.state === 1) {
			initClock($scope.env.quarterLength, $scope.game.quarter);
			clock.start();
			$scope.button.state = 2;
			$scope.button.text = "Pause";
			$scope.button.context = "warning";
		} else if ($scope.button.state === 2) {
			clock.stop();
			$scope.button.state = 3;
			$scope.button.text = "Resume";
			$scope.button.context = "success";
		} else if ($scope.button.state === 3) {
			clock.start()
			$scope.button.state = 2;
			$scope.button.text = "Pause";
			$scope.button.context = "warning";
		} else if ($scope.button.state === 4) {
			$scope.game.playTime = $scope.env.quarterLength;
			$scope.game.quarter ++;
			$scope.game.$save();
			$scope.button.state = 1;
			$scope.button.text = "Start" + $scope.game.quarter + "<sup>" + $rootScope.ordinal($scope.game.quarter) + "</sup> Quarter";
			$scope.button.context = "primary";
		} else if ($scope.button.state === 5) {
			$scope.game.live = false;
			$scope.game.quarter = false;
			$scope.game.$save();
			$state.go('adminDash');
		} else if ($scope.button.state === 6) {
			$scope.game.quarter = 'OT1';
			$scope.game.playTime = $scope.env.otQLength;
			$scope.game.ot = true;
			$scope.game.$save();
			$scope.button.state = 7;
			$scope.button.text = "Start 1<sup>st</sup> Half Over Time";
			$scope.button.context = "info";
		} else if ($scope.button.state === 7) {
			initClock($scope.env.otQLength, $scope.game.quarter);
			clock.start();
			$scope.button.state = 2;
			$scope.button.text = "Pause";
			$scope.button.context = "warning";
		} else if ($scope.button.state === 8) {
			$scope.game.live = false;
			$scope.game.quarter = false;
			$scope.game.$save();
			$state.go('adminDash');
		} else if ($scope.button.state === 9) {
			$scope.game.quarter = 'OT2';
			$scope.game.playTime = $scope.env.otQLength;
			$scope.game.$save();
			$scope.button.state = 10;
			$scope.button.text = "Start 2<sup>nd</sup> Half Over Time";
			$scope.button.context = "Primary";
		} else if ($scope.button.state === 10) {
			initClock($scope.env.otQLength, $scope.game.quarter);
			clock.start();
			$scope.button.state = 2;
			$scope.button.text = "Pause";
			$scope.button.context = "warning";
		} else if ($scope.button.state === 11) {
			$scope.game.live = false;
			$scope.game.quarter = false;
			$scope.game.$save();
			$state.go('adminDash');
		}
		//console.log($scope.button.state);
	};

	//code for countdown clock
	var clock, countdownClock, options, formatString, interval;
	function toMs (time) {
		//console.log(time.indexOf(':'));
		if (time.indexOf(':') == -1) {
			console.log(parseInt(time.substr(0, 2)) * 1000 + parseInt(time.substr(3, 2)));
			return parseInt(time.substr(0, 2)) * 1000 + parseInt(time.substr(3, 2));
		} else {
			console.log(parseInt(time.substr(0, 1)) * 60000 + parseInt(time.substr(2, 2)) * 1000);
			return parseInt(time.substr(0, 1)) * 60000 + parseInt(time.substr(2, 2)) * 1000;
		}
	};

	function initClock (time, quarter) {
		options = {
			countdown: true,
			interval: 1000,
			startTime: toMs(time),
			onTick: function () {
				if (clock.lap() < 60000) {
					formatString = "{ss}.{ll}"
				} else {
					formatString = "{m}:{ss}";
				}
				$scope.game.playTime = clock.lap(formatString).substr(0, 5);
				console.log($scope.game.playTime);
				$scope.game.$save();
			},
			onComplete: function () {
				if ($scope.game.quarter == 1 || $scope.game.quarter == 2 || $scope.game.quarter == 3) {
					$scope.button.state = 4;
					$scope.button.text = "End " + $scope.game.quarter + "<sup>" + $rootScope.ordinal($scope.game.quarter) + "</sup> quarter with score:<br>" + $scope.game.home + ": " + $scope.game.hScore + " & " + $scope.game.away + ": " + $scope.game.aScore;
					$scope.button.context = "warning";
				} else if ($scope.game.quarter == 4) {
					if ($scope.game.hScore == $scope.game.aScore) {
						$scope.game.ot = true;
						$scope.game.$save();
						$scope.button.state = 6;
						$scope.button.text = "End standard time with score tied at " + $scope.game.hScore;
						$scope.button.context = "warning";
					} else {
						$scope.button.state = 5;
						$scope.button.text = "End game with final score <br>" + $scope.game.home + ": " + $scope.game.hScore + " & " + $scope.game.away + ": " + $scope.game.aScore;
						$scope.button.context = "danger";
					}
				} else if ($scope.game.quarter == "OT1") {
					if ($scope.game.hScore == $scope.game.aScore) {
						$scope.button.state = 9;
						$scope.button.text = "End 1<sup>st</sup> half OT with score tied at " + $scope.game.hScore;
						$scope.button.context = "warning";
					} else {
						$scope.button.state = 8;
						$scope.button.text = "End game after 1 half OT with final score <br>" + $scope.game.home + ": " + $scope.game.hScore + " & " + $scope.game.away + ": " + $scope.game.aScore;
						$scope.button.context = "danger";
					}
				} else if ($scope.game.quarter == "OT2") {
					$scope.button.state = 11;
					$scope.button.text = "End game after 2 halfs OT with final score <br>" + $scope.game.home + ": " + $scope.game.hScore + " & " + $scope.game.away + ": " + $scope.game.aScore;
					$scope.button.context = "danger";
				}
			}
		};
		clock = new Tock(options);
	};

	//set initial values for button - if not default
	function init () {
		//if all default
		if ($scope.game.quarter != 0) {
			if ($scope.game.playTime == "7:00") {

			}
		}
	};
	init();


	//MODAL section
	var id, inputtedString, quarterEntry;
	$scope.sectionOpenB = null;
	$scope.changeQuarter = function (event) {
		event.preventDefault();
		$(".modal").modal('hide');
		quarterEntry = $("#edit-quarter input[type= 'text']").val();
		try {
			if (parseInt(quarterEntry.charAt(0)) === null || parseInt(quarterEntry.charAt(0)) < 0 || parseInt(quarterEntry.charAt(0)) > 7) {
				alert("You must set a value for minutes which is between 0 and 7.");
				return;
			} else if (quarterEntry.charAt(1) != ':') {
				alert("The second character must be a semicolon \(:\).");
				return;
			} else if (parseInt(quarterEntry.substring(2, (quarterEntry.length - 1))) === null || parseInt(quarterEntry.substring(2, (quarterEntry.length - 1))) >= 60 || parseInt(quarterEntry.substring(2, (quarterEntry.length - 1))) < 0) {
				alert("You must enter a value for seconds which is between 0 and 59");
				return;
			}
		} catch(error) {
			alert("An error occured:\n" + error);
		}
		$("#edit-quarter input[type= 'text']").val('');
		$scope.env.quarterLength = quarterEntry;
	};
	$scope.manualTimeForm = function (event) {
		event.preventDefault();

		inputtedString = $rootScope.processManualTime($scope.manualTime.min, $scope.manualTime.sec, $scope.manualTime.mms, $scope.manualTime.quarter);
		if (!inputtedString) {
			return;
		}
		$scope.game.playTime = inputtedString[0];
		$scope.game.quarter = inputtedString[1];
		if ($scope.game.quarter == 0 || !$scope.game.quarter) {
			$scope.game.live = false;
		} else {
			$scope.game.live = true;
		}
		$scope.game.$save().then(function () {
			$rootScope.processing = false;
			$scope.manualTime.min = null;
			$scope.manualTime.sec = null;
			$scope.manualTime.mms = null;
			$(".modal").modal('hide');
		}, function (error) {
			alert("An error occurred while syncing the play time with the database.\nHere is the error info:\n" + error);
		});
	};
	$scope.resetGame = function (event) {
		event.preventDefault();

		if (confirm("Doing this will irrevocably reset the game as if it did not happen.\n\(Note\: this will not impact stats and scores\)\nAre you sure you want to continue?")) {
			$scope.game.playTime = "7:00";
			$scope.game.quarter = 0;
			$scope.game.live = false;
			$scope.game.finished = false;
			$scope.game.ot = false;
			$scope.game.aScore = 0;
			$scope.game.hScore = 0;
		}

		$(".modal").modal('hide');
	};
	$scope.endGame = function (event) {
		event.preventDefault();

		if (confirm("Doing this will irrevocably reset the game as if it did not happen.\n\(Note\: this will not impact stats and scores\)\nAre you sure you want to continue?")) {
			$scope.game.quarter = false;
			$scope.game.live = false;
			$scope.game.finished = true;
		}

		$(".modal").modal('hide');
	};
}]);
