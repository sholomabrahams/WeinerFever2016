var weinerControllers = angular.module('weinerControllers', []);

/* FACTORIES */
weinerControllers.run(['$rootScope', '$http', function($rootScope, $http){
	//Set body class no-touch if not touchscreen
	if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
		$rootScope.touch = "no-touch";
	}


	$rootScope.toggleMenu = function () {
		if ($rootScope.menuOpen == "closed") {
			$rootScope.menuOpen = "open";
		} else {
			$rootScope.menuOpen = "closed";
		}
	}

	$rootScope.menuOpen = "closed";

	var data;
	var current;
	var games;
	$http.get('/ng/weinerfever.json').then(function (response) {
		data = response.data;
		games = data.games;
		//console.log(data);
		for (game in games) {
			console.log(game.home);
			if (game.home == "Beth Tfiloh" || game.home == "Boyar") {
				console.log(data.teams[game.home]);
				data.games[game].hPath = data.teams[game.home].path;
			} else {
				data.games[game].hPath = "Ramaz";
			}
		}
		$rootScope.games = games;
		$rootScope.teams = data.teams;
	});

	//Makes base firebase ref available as $rootScope.ref
//	$rootScope.ref = new Firebase("https://weinerfever.firebaseio.com/");
}]);

/*CONTROLLERS*/
weinerControllers.controller('home', ['$scope', '$firebaseObject', '$rootScope', '$http', function($scope, $firebaseObject, $rootScope, $http) {
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