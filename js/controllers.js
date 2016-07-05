var weinerControllers = angular.module('weinerControllers', []);

/* FACTORIES */
weinerControllers.run(['$rootScope', '$http', '$firebaseArray', '$state', function($rootScope, $http, $firebaseArray, $state) {
	//Set body class no-touch if not touchscreen
	if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
		$rootScope.touch = "no-touch";
	}

	//toggles or closes side menu
	$rootScope.menuOpen = "closed";

	$rootScope.toggleMenu = function (e) {
		if ($rootScope.menuOpen == "closed") {
			$rootScope.menuOpen = "open";
		} else {
			$rootScope.menuOpen = "closed";
		}
	};
	$rootScope.closeMenu = function () {
		$rootScope.menuOpen = "closed";
	};

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
			$state.go("home");
		}
	});


	//Makes firebase refs available
	$rootScope.rootRef = new Firebase('https://weinerfever.firebaseio.com/');

	$rootScope.teamsRef = new Firebase("https://weinerfever.firebaseio.com/teams");

	$rootScope.gamesRef = new Firebase("https://weinerfever.firebaseio.com/games");

	$rootScope.statsRef = new Firebase("https://weinerfever.firebaseio.com/stats");
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

weinerControllers.controller('adminLogin', ['$scope', 'currentAuth', function($scope, currentAuth) {
	$scope.disabled = false;

	$scope.logIn = function () {
		$scope.disabled = true;
		$scope.entry = $scope.email + "   " + $scope.password;
		$scope.email = null;
		$scope.password = null;
	}

	$scope.auth = currentAuth;
	console.log($scope.auth);
}]);

weinerControllers.controller('adminDash', ['$scope', '$firebaseArray', 'currentAuth', function($scope, $firebaseArray, currentAuth) {
	$scope.welcome = "hello";
}]);