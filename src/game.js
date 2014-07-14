define(['world', '../config/obstructions-config', '../config/game-config', 'Creature'], function (world, obstructionsConfig, config, Creature) {
	'use strict';
	var game = {
		init: function () {
			world.create(obstructionsConfig);
			world.addCreature(new Creature(Creature.TypeEnum.PACMAN));
		}
	};
	return game;
});
