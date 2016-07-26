/*weinerApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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
}]);*/

weinerApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');

	$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'templates/home.html',
			controller: 'home'
		}).
		state('games', {
			url: '/games',
			templateUrl: 'templates/games.html',
			controller: 'games'
		}).
		state('games.showStats', {
			url: '/:team/:gender',
			resolve: {
				gamepStats: ['$firebaseArray', '$rootScope', function ($firebaseArray, $rootScope) {
					return /*$firebaseArray($rootScope.rootRef.child("stats").child(gender).child(team).orderByKey())*/;
				}]
			}
		}).
		state('teams', {
			url: '/teams',
			templateUrl: 'templates/teams.html',
			controller: 'teams'
		}).
		state('adminLogin', {
			url: '/admin',
			templateUrl: 'templates/admin/login.html',
			controller: 'adminLogin',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$waitForAuth();
				}]
			}
		}).
		state('adminDash', {
			url: '/admin/dash',
			templateUrl: 'templates/admin/dash.html',
			controller: 'adminDash',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$requireAuth();
				}]
			}
		}).state('gameEditor', {
			url: '/admin/:gameCode',
			templateUrl: 'templates/admin/set_games.html',
			controller: 'gameEditor',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$requireAuth();
				}]
			}
		});
}]);