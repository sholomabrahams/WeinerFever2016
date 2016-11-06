weinerApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise('/');
	$locationProvider.html5Mode(true);

	$stateProvider.
		state('adminLogin', {
			url: '/',
			templateUrl: '/templates/admin/login.html',
			controller: 'adminLogin',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$waitForAuth();
				}]
			}
		}).
		state('adminDash', {
			url: '/dash',
			templateUrl: '/templates/admin/dash.html',
			controller: 'adminDash',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$requireAuth();
				}]
			}
		}).
		state('gameEditorBoth', {
			url: '/edit/:gameCode/both',
			templateUrl: '/templates/admin/set_games_both.html',
			controller: 'gameEditorBoth',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$requireAuth();
				}]
			}
		}).
		state('gameEditorStats', {
			url: '/edit/:gameCode/stats',
			templateUrl: '/templates/admin/set_games_both.html',
			controller: 'gameEditorBoth',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$requireAuth();
				}]
			}
		}).
		state('gameEditorTime', {
			url: '/edit/:gameCode/time',
			templateUrl: '/templates/admin/set_games_time.html',
			controller: 'gameEditorTime',
			resolve: {
				"currentAuth": ["Auth", function (Auth) {
					return Auth.$requireAuth();
				}]
			}
		});
}]);