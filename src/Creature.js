define([ '../config/game-config', 'world', 'DirectionEnum' ], function (config, world, DirectionEnum) {
	'use strict';
	function Creature(type, color, name, size, speed) {
		this.type = type;
		this.size = size || config.creatureSize;
		this.stepSize = config.pointSize;
		this.currentDirection = DirectionEnum.EAST;
		this.speed = speed || config.movingSpeed.pacman;
		if (type === Creature.TypeEnum.PACMAN) {
			this.color = color || 'yellow';
			this.name = name || 'pac-man';
		} else {
			this.color = color;
			this.name = name;
		}
	}

	Creature.TypeEnum = {
		'PACMAN': 'pacman',
		'GHOST': 'ghost'
	};

	Creature.prototype.move = function (diff) {
		var deltaX, deltaY;
		switch (this.currentDirection) {
			case DirectionEnum.NORTH:
				deltaX = 0;
				deltaY = -diff;
				break;
			case DirectionEnum.EAST:
				deltaX = diff;
				deltaY = 0;
				break;
			case DirectionEnum.WEST:
				deltaX = -diff;
				deltaY = 0;
				break;
			case DirectionEnum.SOUTH:
				deltaX = 0;
				deltaY = diff;
				break;
		}
		world.moveCreature(this, deltaX, deltaY);
	};

	Creature.prototype.goWest = function () {
		this.currentDirection = DirectionEnum.WEST;
		this.move(1);
	};

	Creature.prototype.goEast = function () {
		this.currentDirection = DirectionEnum.EAST;
		this.move(1);
	};

	Creature.prototype.goNorth = function () {
		this.currentDirection = DirectionEnum.NORTH;
		this.move(1);
	};

	Creature.prototype.goSouth = function () {
		this.currentDirection = DirectionEnum.SOUTH;
		this.move(1);
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
