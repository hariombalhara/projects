var config = {
	numberOfPelletsAlongX: 26,
	numberOfPelletsAlongY: 29,

	// Keep it even
	pelletSize: 2,
	pelletColor: 'white',

	obstructionColor: 'blue',
	backgroundColor: 'black',
	borderSpacing: 20,
	pelletSpacing: 16,
	creatureSize: 12, //How many times is it bigger than pellet
	obstructionStrokeWidth: 1,

	//per second
	movingSpeed: {
		pacman: 2 //Must be a factor of (pelletSize + pelletSpacing)
	},

	initialPacmanLocation: {
		x: 0,
		y: 0
	}
};
export default config;