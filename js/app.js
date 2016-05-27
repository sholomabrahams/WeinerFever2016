var weinerApp = angular.module('weinerApp', [
	'ngRoute',
	'weinerControllers',
	'animations',
	'firebase'
]);


weinerApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: 'templates/home.html',
			controller: 'home'
		}).
		when('/games', {
			templateUrl: 'templates/games.html',
			controller: 'games'
		}).
		otherwise({
			redirectTo: '/'
		});
}]);



/*weinerApp.factory('liveGames', ['$firebaseArray', function($firebaseArray){
	var ref = new Firebase("https://weiner.firebaseio.com");
	return $firebaseArray(ref);
}]);*/