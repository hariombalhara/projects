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

	Creature.prototype.updateCoordinates = function (x, y) {
		this.x = x;
		this.y = y;
		if (this.type === Creature.TypeEnum.PACMAN) {
			world.gulpPellet(x, y);
		}
	};
	Creature.prototype.move = function (diff) {
		var deltaX, deltaY, creature = this;
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
		creature.moves = creature.moves || [];
		creature.moves.push({
			deltaX: deltaX,
			deltaY: deltaY
		});
	};

	Creature.prototype.goWest = function () {
		if (this.currentDirection === DirectionEnum.WEST) {
			return;
		}
		this.currentDirection = DirectionEnum.WEST;
		this.move(1);
	};

	Creature.prototype.goEast = function () {
		if (this.currentDirection === DirectionEnum.EAST) {
			return;
		}
		this.currentDirection = DirectionEnum.EAST;
		this.move(1);
	};

	Creature.prototype.goNorth = function () {
		if (this.currentDirection === DirectionEnum.NORTH) {
			return;
		}
		this.currentDirection = DirectionEnum.NORTH;
		this.move(1);
	};

	Creature.prototype.goSouth = function () {
		if (this.currentDirection === DirectionEnum.SOUTH) {
			return;
		}
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
