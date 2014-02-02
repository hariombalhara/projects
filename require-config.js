require.config({
	baseUrl: 'js',
	callback: function () {
		require(['architecture'], function (pacman) {
			pacman.init();
		});
	}
});