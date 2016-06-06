var weinerControllers = angular.module('weinerControllers', []);

/* FACTORIES */
weinerControllers.run(['$rootScope', '$http', '$location', function($rootScope, $http, $location){
	//Set body class no-touch if not touchscreen
	if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
		$rootScope.touch = "no-touch";
	}

	//toggles or closes side menu
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

	$rootScope.menuOpen = "closed";

	//offline db bootstrap
	var data;
	$http.get("/ng/weinerfever.json").then(function (response) {
		data = response.data;
		$rootScope.games = data.games;
		$rootScope.teams = data.teams;
	});

	//returns gender of the game
	$rootScope.getGender = function (name) {
		if (name.substring(0, 4).toLowerCase() == "boys") {
			return "boys";
		} else {
			return "girls";
		}
	};

	$rootScope.sortGames = function (game) {
		
	}


	//firebase auth handles on routes
	$rootScope.$on('$routeChangeError', function(event, next, previous, error) {
		if (error === "AUTH_REQUIRED") {
			$location.path("/");
		}
	});


	//Makes base firebase ref available as $rootScope.ref
//	$rootScope.ref = new Firebase("https://weinerfever.firebaseio.com/");
}]);

/*CONTROLLERS*/
weinerControllers.controller('home', ['$scope', '$firebaseObject', '$rootScope', function($scope, $firebaseObject, $rootScope) {
//	var obj = new $firebaseObject($rootScope.ref.child('games').child('b01').child('time'));
	//obj.$loaded().then(function () {console.log(obj)});
//	$scope.games = obj;
	/*var unwatch = obj.$watch(function () {
		if (!($scope.games.$value)) {
			$scope.show = "none";
			//console.log($scope.games.$value);
		} else {
			$scope.show = "block";
			//console.log($scope.games.$value);
		}
	});*/
}]);

weinerControllers.controller('games', ['$scope', '$firebaseObject', '$rootScope', function ($scope, $firebaseObject, $rootScope) {
//	var obj2 = new $firebaseObject($rootScope.ref.child('games').child('b01').child('time'));
	//obj2.$loaded().then(function () {console.log(obj2)});
}]);

weinerControllers.controller('teams', ['$scope', function($scope){
	$scope.message = "teams page";
}]);

weinerControllers.controller('adminLogin', ['$scope', function($scope){
	$scope.disabled = false;

	$scope.logIn = function () {
		$scope.disabled = true;
		$scope.entry = $scope.email + "   " + $scope.password;
		$scope.email = null;
		$scope.password = null;
	}
}]);

weinerControllers.controller('adminDash', ['$scope', '$firebaseArray', 'currentAuth', function($scope, $firebaseArray, currentAuth){
	
}]);