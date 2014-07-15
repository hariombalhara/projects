define([], function () {
	'use strict';
	var config = {
		numberOfPelletsAlongX: 26,
		numberOfPelletsAlongY: 26,

		// Keep it even
		pelletSize: 2,
		pelletColor: 'white',

		obstructionColor: 'blue',
		backgroundColor: 'black',
		borderSpacing: 20,
		pelletSpacing: 18,
		creatureSize: 10, //How many times is it bigger than pellet
		obstructionStrokeWidth: 2,

		//per second
		movingSpeed: {
			pacman: 2
		},

		initialPacmanLocation: {
			x: 0,
			y: 0
		}
	};
	return config;
});
