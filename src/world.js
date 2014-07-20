define([
	'PlottablePoint',
	'Obstruction',
	'../config/game-config',
	'DirectionEnum',
	'../utils/canvasUtils'
], function (PlottablePoint, Obstruction, config, DirectionEnum, canvasUtils) {
	'use strict';
	var canvas,
		pi = 3.14,
		world = {};
	function log() {
		//window.console.log.apply(window.console, [].slice.call(arguments));
	}

	function getCenterForPellet(x, y) {
		return {
			x: (2 * x + 1) * config.pelletSize / 2 + x * config.pelletSpacing + config.borderSpacing,
			y: (2 * y + 1) * config.pelletSize / 2 + y * config.pelletSpacing + config.borderSpacing
		};
	}

	var getCenterForCreature = getCenterForPellet;

	var getDistance = function (distance) {
		return (distance + 1) * config.pelletSize + distance * config.pelletSpacing;
	};

	function drawPellet(x, y) {
		var pelletColor = config.pelletColor,
			pelletRadius = config.pelletSize / 2,
			center = getCenterForPellet(x, y);

		world.canvasContext.fillStyle = pelletColor;
		world.canvasContext.beginPath();
		world.canvasContext.arc(center.x, center.y, pelletRadius, 0, 2 * pi);
		world.canvasContext.fill();
	}

	function getRectangleTopLeftCoordinateFromPellet(x, y) {
		var topLeftPelletCenter = getCenterForPellet(x, y);
		return {
			x: topLeftPelletCenter.x - config.pelletSize / 2,
			y: topLeftPelletCenter.y - config.pelletSize / 2
		};
	}

	function drawObstruction(obstruction) {
		var coords = obstruction.coords,
			tCoords = obstruction.tCoords,
			topLeft = getRectangleTopLeftCoordinateFromPellet(coords.x1, coords.y1);
		world.canvasContext.lineWidth = config.obstructionStrokeWidth;
		world.canvasContext.strokeStyle = config.obstructionColor;
		world.canvasContext.fillStyle = config.obstructionColor;
		canvasUtils.drawRoundedCornerRectangle(world.canvasContext, topLeft.x, topLeft.y, getDistance(coords.width), getDistance(coords.height), 10).fill();
		if (tCoords) {
			topLeft = getRectangleTopLeftCoordinateFromPellet(tCoords.x1, tCoords.y1);
			canvasUtils.drawRoundedCornerRectangle(world.canvasContext, topLeft.x, topLeft.y, getDistance(tCoords.width), getDistance(tCoords.height), 10).fill();
		}
	}

	function deleteCreature(creature, x, y) {
		var creatureSize = creature.size * config.pelletSize,
			r = creatureSize / 2 + 1;

		if (!x) {
			x = getCenterForCreature(creature.x, y).x;
		}
		if (!y) {
			y = getCenterForCreature(x, creature.y).y;
		}

		world.canvasContext.fillStyle = config.backgroundColor;
		world.canvasContext.beginPath();
		world.canvasContext.arc(x, y, r, 0, 2 * pi);
		world.canvasContext.fill();
		log('Deleted ' + creature.name + ' with x=' + x + ' y=' + y + ' r=' + r);
	}

	// Animates along one direction
	// speed -> pixels at a time
	function animateCreatureMove(creature, start, end, direction, doneCallback, progressCallback) {
		var speed = creature.speed,
			acrossAxis,
			unitVector;
		switch (direction) {
			case DirectionEnum.NORTH:
				acrossAxis = 'Y';
				unitVector = -1;
				break;
			case DirectionEnum.EAST:
				acrossAxis = 'X';
				unitVector = 1;
				break;
			case DirectionEnum.WEST:
				acrossAxis = 'X';
				unitVector = -1;
				break;
			case DirectionEnum.SOUTH:
				acrossAxis = 'Y';
				unitVector = 1;
				break;
		}
		world.pendingRequests = world.pendingRequests || [];
		world.pendingAnimationReqIds = world.pendingAnimationReqIds || [];
		var animRequest = (function animate(i, unitVector, speed) {
			world.pendingRequests.push({
				i: i,
				unitVector: unitVector,
				speed: speed
			});
			return window.requestAnimationFrame(function () {
				if (typeof i === 'undefined') {
					i = 0;
				}
				var velocity = speed * unitVector;
				world.pendingRequests.splice(0, 1);
				world.pendingAnimationReqIds.splice(0, 1);
				var nextLoc = start + (i + 1) * velocity;
				if (unitVector > 0 && nextLoc > end || unitVector < 0 && nextLoc < end) {
					doneCallback(unitVector);
					return;
				}
				if (acrossAxis === 'X') {
					deleteCreature(creature, start + i * velocity);
					drawCreature(creature, nextLoc);
				} else {
					deleteCreature(creature, null, start + i * velocity);
					drawCreature(creature, null, nextLoc);
				}
				animRequest = animate(i + 1, unitVector, speed);
				world.pendingAnimationReqIds.push(animRequest);
				progressCallback(animRequest);
			});
		})(0, unitVector, speed);
		world.pendingAnimationReqIds.push(animRequest);
		return animRequest;
	}

	function getNextMove(creature, expectedDeltaX, expectedDeltaY) {
		var coords = creature.moves.shift();
		if (!coords) {
			coords = {
				deltaX: expectedDeltaX || (creature.currentDirection === DirectionEnum.EAST ? 1 : creature.currentDirection === DirectionEnum.WEST ? -1 : 0),
				deltaY: expectedDeltaY || (creature.currentDirection === DirectionEnum.SOUTH ? 1 : creature.currentDirection === DirectionEnum.NORTH ? -1 : 0)
			};
		}
		moveCreature(creature, coords.deltaX, coords.deltaY);
	}

	function updateScore(creature, change) {
		var scoreBoard = document.getElementsByClassName('js-score')[0];
		creature.score = creature.score || 0;
		creature.score += change;
		scoreBoard.innerHTML = creature.score;
	}

	function moveCreature(creature, deltaX, deltaY) {
		var currentX = creature.x,
			currentY = creature.y,
			newX = creature.x + (deltaX || 0),
			newY = creature.y + (deltaY || 0);
		if (world.isPointOutside(newX, newY) || world.isPointOccupiedByObstruction(newX, newY)) {
			setTimeout(function () {
				getNextMove(creature);
			});
			return;
		}

		var newCenterOnCanvas = getCenterForCreature(newX, newY),
			currentCenterOnCavas = getCenterForCreature(currentX, currentY),
			newXOnCanvas = newCenterOnCanvas.x,
			newYOnCanvas = newCenterOnCanvas.y,
			currentXOnCanvas = currentCenterOnCavas.x,
			currentYOnCanvas = currentCenterOnCavas.y,
			isPelletPresent  = world.isPelletPresent(newX, newY);

		creature.updateCoordinates(newX, newY);
		for (var i = 0; world.pendingAnimationReqIds && i < world.pendingAnimationReqIds.length; i++) {
			window.cancelAnimationFrame(world.pendingAnimationReqIds[i]);
		}
		if (deltaX && !deltaY) {
			animateCreatureMove(creature, currentXOnCanvas, newXOnCanvas, (deltaX > 0 ? DirectionEnum.EAST : DirectionEnum.WEST), function (unitVector) {
				getNextMove(creature, unitVector, 0);
				if (isPelletPresent) {
					updateScore(creature, 1);
				}
			}, function (reqId) {
				world.reqX = reqId;
			});
		} else if (deltaY && !deltaX) {
			animateCreatureMove(creature, currentYOnCanvas, newYOnCanvas, (deltaY > 0 ? DirectionEnum.SOUTH : DirectionEnum.NORTH), function (unitVector) {
				getNextMove(creature, 0, unitVector);
				if (isPelletPresent) {
					updateScore(creature, 1);
				}
			}, function (reqId) {
				world.reqY = reqId;
			});
		}
	}

	function putCreature(creature, x, y) {
		var center = getCenterForCreature(x, y);
		creature.updateCoordinates(x, y);
		drawCreature(creature, center.x, center.y);
	}

	function drawCreature(creature, x, y) {
		var creatureSize = creature.size * config.pelletSize,
			r = creatureSize / 2,
			startAngle,
			endAngle;

		if (creature.currentDirection === DirectionEnum.EAST) {
			startAngle = 30;
			endAngle = 330;
		} else if (creature.currentDirection === DirectionEnum.WEST) {
			startAngle = 210;
			endAngle = 150;
		} else if (creature.currentDirection === DirectionEnum.SOUTH) {
			startAngle = 120;
			endAngle = 60;
		} else {
			startAngle = 300;
			endAngle = 240;
		}

		if (!x) {
			x = getCenterForCreature(creature.x, y).x;
		}
		if (!y) {
			y = getCenterForCreature(x, creature.y).y;
		}

		//Make body
		world.canvasContext.fillStyle = creature.color;
		world.canvasContext.beginPath();
		world.canvasContext.arc(x, y, r, startAngle * (pi / 180), endAngle * (pi / 180));
		world.canvasContext.lineTo(x, y);
		world.canvasContext.fill();

		log('Created ' + creature.name + ' with x=' + x + ' y=' + y + ' r=' + r);
	}

	function populateObstructionWithTCoordinates(obstruction) {
		var coords = obstruction.coords,
			tCoords = obstruction.tCoords,
			tDistance = tCoords.distance,
			tHeight = tCoords.height,
			tWidth = tCoords.width,
			tType = tCoords.orientation;
		switch (tType) {
			case Obstruction.TshapeOrientationEnum.TOP:
				tCoords.x1 = tCoords.x4 = coords.x1 + tDistance;
				tCoords.x2 = tCoords.x3 = tCoords.x1 + tWidth;
				tCoords.y3 = tCoords.y4 = coords.y1;
				tCoords.y1 = tCoords.y2 = tCoords.y1 - tHeight;
				break;
			case Obstruction.TshapeOrientationEnum.RIGHT:
				tCoords.x1 = tCoords.x4 = coords.x2;
				tCoords.x2 = tCoords.x3 = tCoords.x1 + tWidth;
				tCoords.y1 = tCoords.y2 = coords.y1 + tDistance;
				tCoords.y3 = tCoords.y4 = tCoords.y1 + tHeight;
				break;
			case Obstruction.TshapeOrientationEnum.BOTTOM:
				tCoords.x1 = tCoords.x4 = coords.x1 + tDistance;
				tCoords.x2 = tCoords.x3 = tCoords.x1 + tWidth;
				tCoords.y1 = tCoords.y2 = coords.y3;
				tCoords.y3 = tCoords.y4 = tCoords.y1 + tHeight;
				break;
			case Obstruction.TshapeOrientationEnum.LEFT:
				tCoords.x2 = tCoords.x3 = coords.x1;
				tCoords.x1 = tCoords.x4 = coords.x1 - tWidth;
				tCoords.y1 = tCoords.y2 = coords.y1 + tDistance;
				tCoords.y3 = tCoords.y4 = tCoords.y1 + tHeight;
				break;
		}
	}

	function createCanvas() {
		canvas = document.querySelector('canvas');
		var numberOfPelletsAlongX = config.numberOfPelletsAlongX,
			numberOfPelletsAlongY = config.numberOfPelletsAlongY,
			pelletSize = config.pelletSize,
			pelletSpacing = config.pelletSpacing,
			borderSpacing = config.borderSpacing,
			height = (numberOfPelletsAlongY * pelletSize + (numberOfPelletsAlongY - 1) * pelletSpacing + 2 * borderSpacing),
			width = (numberOfPelletsAlongX * pelletSize + (numberOfPelletsAlongX - 1) * pelletSpacing + 2 * borderSpacing),
			canvasContext = canvas.getContext('2d');

		canvas.height = height;
		canvas.width = width;
		return canvasContext;
	}

	function populateAllCoordinatesInObstruction(obstruction) {
		var coords = obstruction.coords,
			obstructionType = obstruction.type;

		//Clockwise coordinates(in terms of number of points) starting from top left.
		coords.x1 = coords.x;
		coords.y1 = coords.y;
		coords.x2 = coords.x1 + coords.width;
		coords.y2 = coords.y1;
		coords.x3 = coords.x2;
		coords.y3 = coords.y2 + coords.height;
		coords.x4 = coords.x1;
		coords.y4 = coords.y1 + coords.height;

		if (obstructionType === Obstruction.TypeEnum.T_SHAPED) {
			populateObstructionWithTCoordinates(obstruction);
		}
		return obstruction;
	}

	function occupyPossiblePelletsInRectangle(coords, obstruction) {
		var ix = coords.x1,
			jy;

		while (ix <= coords.x2) {
			jy = coords.y1;
			while (jy <= coords.y4) {
				world.addToMatrix(ix, jy, PlottablePoint.TypeEnum.OBSTRUCTION, obstruction);
				jy++;
			}
			ix++;
		}
	}

	world = {
		matrix: {},
		creatures: [],
		start: function () {
			this.setCreaturesToAutoMove();
		},
		addCreature: function (creature) {
			this.creatures.push(creature);
			if (creature) {
				putCreature(creature, config.initialPacmanLocation.x, config.initialPacmanLocation.y);
			}
		},
		create: function (obstructions) {
			var type,
				pelletSize = config.pelletSize,
				numberOfPelletsAlongX = config.numberOfPelletsAlongX,
				numberOfPelletsAlongY = config.numberOfPelletsAlongY;

			world.canvasContext = createCanvas();

			this.createObstructionsFromConfig(obstructions);

			for (var i = 0; i < numberOfPelletsAlongX; i++) {
				for (var j = 0; j < numberOfPelletsAlongY; j++) {
					if (this.isPointOccupied(i, j)) {
						continue;
					}
					drawPellet(i, j);
					type = PlottablePoint.TypeEnum.PELLET;
					this.addToMatrix(i, j, type, pelletSize);
				}
			}
		},
		isPointOccupied: function (x, y) {
			return this.matrix[x + ',' + y];
		},
		addToMatrix: function (x, y, type, dimensions) {
			this.matrix[x + ',' + y] = new PlottablePoint(type, dimensions);
		},
		drawCreature: drawCreature,
		deleteCreature: deleteCreature,
		moveCreature: moveCreature,
		setCreaturesToAutoMove: function () {
			var pacman = this.creatures[0];
			pacman.move(1);
			world.getNextMove(pacman);
		},
		addDirectionsForPacman: function () {
			var pacman,
				creatures = this.creatures;
			window.addEventListener('keydown', function (e) {
				pacman = creatures[0];
				switch (e.keyCode) {
					case 37:
						pacman.goWest();
						break;
					case 38:
						pacman.goNorth();
						break;
					case 39:
						pacman.goEast();
						break;
					case 40:
						pacman.goSouth();
						break;
				}
			});
		},
		getDistance: getDistance,
		createObstructionsFromConfig: function createObstructionsFromConfig(obstructions) {
			var i;

			for (i = 0; i < obstructions.length; i++) {
				var obstruction = obstructions[i];
				populateAllCoordinatesInObstruction(obstruction);
				this.occupyPossiblePelletsInObstruction(obstruction);
				drawObstruction(obstruction);
			}
		},
		isPointOutside: function (x, y) {
			return x < 0 || y < 0 || x >= config.numberOfPelletsAlongX || y >= config.numberOfPelletsAlongY;
		},
		getFromMatrix: function (x, y) {
			return this.matrix[x + ',' + y];
		},
		isPointOccupiedByObstruction: function (x, y) {
			var point = this.getFromMatrix(x, y);
			if (point.type === PlottablePoint.TypeEnum.OBSTRUCTION) {
				return true;
			}
			return false;
		},
		isPelletPresent: function (x, y) {
			var point = this.getFromMatrix(x, y);
			return point.type === PlottablePoint.TypeEnum.PELLET;
		},
		occupyPossiblePelletsInObstruction: function occupyPossiblePelletsInObstruction(obstruction) {
			var coords = obstruction.coords,
				tCoords = obstruction.tCoords;
			occupyPossiblePelletsInRectangle(coords, obstruction);
			if (tCoords) {
				occupyPossiblePelletsInRectangle(tCoords, obstruction);
			}
		},
		getNextMove: getNextMove,
		gulpPellet: function (x, y) {
			var point = this.matrix[x + ',' + y];
			point.markEmpty();
		}
	};
	world.addDirectionsForPacman();
	window.world = world;
	return world;
});
