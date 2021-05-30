import config from '../config/game-config'
import world from './world'
import DirectionEnum from './DirectionEnum'
'use strict';
function Creature(type, color, name, size, speed) {
	this.type = type;
	this.size = size || config.creatureSize;
	this.stepSize = config.pointSize;
	this.currentDirection = DirectionEnum.EAST;
	this.state = 'RESTING';
	if (type === Creature.TypeEnum.PACMAN) {
		this.color = color || 'yellow';
		this.name = name || 'pac-man';
		this.speed = speed || config.movingSpeed.pacman;
	} else {
		this.color = color;
		this.name = name;
	}
	if (!this.speed) {
		throw 'Speed not specified';
	}
}

Creature.TypeEnum = {
	'PACMAN': 'pacman',
	'GHOST': 'ghost'
};

Creature.prototype.updateCoordinates = function (x, y, direction) {
	this.x = x;
	this.y = y;
	this.currentDirection = direction || this.currentDirection;
	if (this.type === Creature.TypeEnum.PACMAN) {
		world.gulpPellet(x, y);
	}
};

Creature.prototype.move = function (direction) {
	direction = direction || this.currentDirection;
	this.moves = this.moves || [];
	if (this.moves.length === 0) {
		this.moves.push(direction);
	}
	if (this.state !== 'MOVING') {
		world.moveCreature(this);
	}
};

Creature.prototype.iAmMoving = function () {
	this.state = 'MOVING';
};

Creature.prototype.iAmStuck = function () {
	this.state = 'STUCK';
};

Creature.prototype.goWest = function () {
	if (this.currentDirection === DirectionEnum.WEST) {
		return;
	}
	this.move(DirectionEnum.WEST);
};

Creature.prototype.goEast = function () {
	if (this.currentDirection === DirectionEnum.EAST) {
		return;
	}
	this.move(DirectionEnum.EAST);
};

Creature.prototype.goNorth = function () {
	if (this.currentDirection === DirectionEnum.NORTH) {
		return;
	}
	this.move(DirectionEnum.NORTH);
};

Creature.prototype.goSouth = function () {
	if (this.currentDirection === DirectionEnum.SOUTH) {
		return;
	}
	this.move(DirectionEnum.SOUTH);
};

Creature.prototype.draw = function () {
	world.drawCreature(this);
};

Creature.prototype.clear = function () {
	world.deleteCreature(this);
};

Creature.prototype.updatePosition = function () {

};

export default Creature;
