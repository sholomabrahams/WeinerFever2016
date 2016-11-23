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

weinerApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise('/');
	$locationProvider.html5Mode(true);

	$stateProvider.
		state('home', {
			url: '/',
			templateUrl: '/templates/home.html',
			controller: 'home'
		}).
		state('games', {
			url: '/games',
			templateUrl: '/templates/games.html',
			controller: 'games'
		})./*
		state('games.showStats', {
			url: '/:team/:gender',
			resolve: {
				gamepStats: ['$firebaseArray', '$rootScope', function ($firebaseArray, $rootScope) {
					return /*$firebaseArray($rootScope.rootRef.child("stats").child(gender).child(team).orderByKey());
				}]
			}
		}).*/
		state('teams', {
			url: '/teams',
			templateUrl: '/templates/teams.html',
			controller: 'teams'
		}).
		/*state('teamsSchool', {
			url: '/teams/:team',
			templateUrl: 'templates/teams_selected.html',
			controller: 'teamsSelected'
		}).*/
		state('teamsSelected', {
			url: '/teams/:team/:gender',
			templateUrl: '/templates/teams_selected.html',
			controller: 'teamsSelected'
		})
}]);