(function () {
	'use strict';
	require.config({
		baseUrl: 'src',
		callback: function () {
			require(['game'], function (pacman) {
				pacman.init();
			});
		}
	});
})();
