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
weinerControllers.factory('teamsList', ['$firebaseArray', '$firebaseObject', '$rootScope', function($firebaseArray, $firebaseObject, $rootScope) {
	var teamsQuery = $rootScope.teamsRef.orderByKey();
	var gamesQuery = $rootScope.gamesRef.orderByChild('index');
	return [$firebaseArray(teamsQuery), $firebaseObject(gamesQuery)];
}]);

weinerControllers.factory('teamsObject', ['$firebaseObject', '$rootScope', function($firebaseObject, $rootScope) {
	return $firebaseObject($rootScope.teamsRef.orderByKey());
}]);

weinerControllers.factory('stats', ['$firebaseObject', '$rootScope', function($firebaseObject, $rootScope) {
	return $firebaseObject($rootScope.statsRef.orderByKey());
}])


/*CONTROLLERS*/
weinerControllers.controller('home', ['$scope', '$rootScope', '$firebaseArray', 'teamsObject', 'stats', function($scope, $rootScope, $firebaseArray, teamsObject, stats) {
	$scope.liveGames = $firebaseArray($rootScope.gamesRef.orderByChild("live").equalTo(true));
	$scope.otherGames = $firebaseArray($rootScope.gamesRef.orderByChild("live").equalTo(false));
	$scope.teams = $.extend(true, $rootScope.teamsData, teamsObject);
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

weinerControllers.controller('gameEditorBoth', ['$scope', '$firebaseObject', 'currentAuth', '$rootScope', '$state', '$stateParams', function($scope, $firebaseObject, currentAuth, $rootScope, $state, $stateParams) {
	$scope.game = $firebaseObject($rootScope.gamesRef.child($stateParams.gameCode));

	$scope.selectedPlayer = "None Selected";
	$scope.color = "transparent";
	$scope.logo = null;
	$scope.select = function (event) {
		event.stopPropagation();

		if (event.currentTarget != $scope.selectedPlayer) {
			$(".roster tr").removeClass('info');
			$(event.currentTarget).addClass('info');
			$scope.selectedPlayer = $(event.currentTarget).children("td:last-of-type").text();
		}
	};

	$scope.$on('$viewContentLoaded', function (event) {
		size();
	});
}]);
