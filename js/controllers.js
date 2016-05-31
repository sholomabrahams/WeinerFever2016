var weinerControllers = angular.module('weinerControllers', []);

/* FACTORIES */
weinerControllers.run(['$rootScope', function($rootScope){
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

	//Makes base firebase ref available as $rootScope.ref
//	$rootScope.ref = new Firebase("https://weinerfever.firebaseio.com/");
}]);

/*CONTROLLERS*/
weinerControllers.controller('home', ['$scope', '$firebaseObject', '$rootScope', function($scope, $firebaseObject, $rootScope) {
//	var obj = new $firebaseObject($rootScope.ref.child('games').child('b01').child('time'));
	//obj.$loaded().then(function () {console.log(obj)});
//	$scope.games = obj;
	$scope.games = {'$value': '3:30PM'};
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