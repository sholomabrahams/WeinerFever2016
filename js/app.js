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
		when('/teams/:teamName?/:gender?', {
			templateUrl: 'templates/teams.html',
			controller: 'teams'
		}).
		when('/admin', {
			templateUrl: 'templates/admin/login.html',
			controller: 'adminLogin',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$waitForAuth();
				}]
			}
		}).
		when('/admin/dash', {
			templateUrl: 'templates/admin/dash.html',
			controller: 'adminDash',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$requireAuth();
				}]
			}
		}).
		otherwise({
			redirectTo: '/'
		});
}]);



/*weinerApp.factory('liveGames', ['$firebaseArray', function($firebaseArray){
	var ref = new Firebase("https://weiner.firebaseio.com");
	return $firebaseArray(ref);
}]);*/