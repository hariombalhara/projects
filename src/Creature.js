define([ '../config/game-config', 'world' ], function (config, world) {
	'use strict';
	function Creature(type, color, name, size) {
		if (type === Creature.TypeEnum.PACMAN) {
			this.type = type;
			this.color = color || 'yellow';
			this.name = name || 'pac-man';
			this.size = size || config.creatureSize;
			this.stepSize = config.pointSize;
		} else {
			this.type = type;
			this.color = color;
			this.name = name;
			this.size = size || config.creatureSize;
			this.stepSize = config.pointSize;
		}
	}

	Creature.TypeEnum = {
		'PACMAN': 'pacman',
		'GHOST': 'ghost'
	};

	Creature.prototype.move = function (diffX, diffY) {
		world.moveCreature(this, diffX, diffY);
	};

	Creature.prototype.moveLeft = function () {
		this.move(-1, 0);
	};

	Creature.prototype.moveRight = function () {
		this.move(1, 0);
	};

	Creature.prototype.moveUp = function () {
		this.move(0, -1);
	};

	Creature.prototype.moveDown = function () {
		this.move(0, 1);
	};

	Creature.prototype.draw = function () {
		world.drawCreature(this);
	};

	Creature.prototype.clear = function () {
		world.deleteCreature(this);
	};

	Creature.prototype.updatePosition = function () {

	};

	return Creature;
});
