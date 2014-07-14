define([ 'PlottablePoint', 'Obstruction', '../config/game-config' ], function (PlottablePoint, Obstruction, config) {
	'use strict';
	var canvas,
		pi = 3.14,
		world = {};

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

	function drawObstruction(x, y, width, height/*, tCoords*/) {
		var topLeftPelletCenter = getCenterForPellet(x, y),
			topLeftX = topLeftPelletCenter.x - config.pelletSize / 2,
			topLeftY = topLeftPelletCenter.y - config.pelletSize / 2;
			//x1, x2, y1, y2, y3;
		world.canvasContext.lineWidth = config.obstructionStrokeWidth;
		world.canvasContext.fillStyle = 'blue';
		world.canvasContext.fillRect(topLeftX, topLeftY, getDistance(width), getDistance(height));

		//if (tCoords) {
			//x1 = pelletsToCenterOfPellet(tCoords.x1);
			//y1 = pelletsToCenterOfPellet(tCoords.y1);
			//x2 = pelletsToCenterOfPellet(tCoords.x2);
			//y2 = pelletsToCenterOfPellet(tCoords.y2);
			//y3 = pelletsToCenterOfPellet(tCoords.y3);
			//world.canvasContext.fillRect(x1, y1, x2 - x1, y3 - y2);
		//}
	}

	function deleteCreature(creature) {
		var creatureSize = creature.size * config.pelletSize,
			center = getCenterForCreature(creature.x, creature.y);
		world.canvasContext.fillStyle = config.backgroundColor;
		world.canvasContext.beginPath();
		world.canvasContext.arc(center.x, center.y, creatureSize / 2 + 1, 0, 2 * pi);
		world.canvasContext.fill();
	}

	function moveCreature(creature, diffX, diffY) {
		deleteCreature(creature);
		drawCreature(creature, creature.x + diffX, creature.y + diffY);
	}

	function drawCreature(creature, x, y) {
		var creatureSize = creature.size * config.pelletSize,
			center = getCenterForCreature(x, y),
			r = creatureSize / 2;

		creature.x = x;
		creature.y = y;

		world.canvasContext.fillStyle = creature.color;
		world.canvasContext.beginPath();
		world.canvasContext.arc(center.x, center.y, r, 0, 2 * pi);
		world.canvasContext.fill();
	}

	function calculateTCoordinates(x1, x2, x3, x4, y1, y2, y3, y4, tCoords) {
		var tDistance = tCoords.distance,
			tHeight = tCoords.height,
			tWidth = tCoords.width,
			tType = tCoords.orientation;
		switch (tType) {
			case Obstruction.TshapeOrientationEnum.TOP:
				x1 = x4 = x1 + tDistance;
				x2 = x3 = x1 + tWidth;
				y3 = y4 = y1;
				y1 = y2 = y1 - tHeight;
				break;
			case Obstruction.TshapeOrientationEnum.RIGHT:
				x1 = x4 = x2;
				x2 = x3 = x1 + tWidth;
				y1 = y2 = y1 + tHeight;
				y3 = y4 = y1 + tHeight;
				break;
			case Obstruction.TshapeOrientationEnum.BOTTOM:
				x1 = x4 = x1 + tDistance;
				x2 = x3 = x1 + tWidth;
				y1 = y2 = y3;
				y3 = y4 = y1 + tHeight;
				break;
			case Obstruction.TshapeOrientationEnum.LEFT:
				x2 = x3 = x1;
				x1 = x4 = x1 - tWidth;
				y1 = y2 = y1 + tHeight;
				y3 = y4 = y1 + tHeight;
				break;
		}
		//Returns in terms of number of points;
		return {
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2,
			x3: x3,
			y3: y3,
			x4: x4,
			y4: y4
		};
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

	world = {
		matrix: {},
		_creatures: [],
		addCreature: function (creature) {
			this._creatures.push(creature);
			if (creature) {
				drawCreature(creature, config.initialPacmanLocation.x, config.initialPacmanLocation.y);
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
					if (this.isOccupied(i, j)) {
						continue;
					}
					drawPellet(i, j);
					type = PlottablePoint.TypeEnum.PELLET;
					this.addToMatrix(i, j, type, pelletSize);
				}
			}
		},
		isOccupied: function (x, y) {
			return this.matrix[x + ',' + y];
		},
		addToMatrix: function (x, y, type, pelletSize) {
			this.matrix[x + ',' + y] = new PlottablePoint(type, pelletSize);
		},
		drawCreature: drawCreature,
		deleteCreature: deleteCreature,
		moveCreature: moveCreature,
		setCreaturesToAutomove: function () {
			//this._creatures[0].move
		},
		addDirectionsForPacman: function () {
			var pacman,
				creatures = this._creatures;
			window.addEventListener('keydown', function (e) {
				pacman = creatures[0];
				switch (e.keyCode) {
					case 37:
						pacman.moveLeft();
						break;
					case 38:
						pacman.moveUp();
						break;
					case 39:
						pacman.moveRight();
						break;
					case 40:
						pacman.moveDown();
						break;
				}
			});
		},
		getDistance: getDistance,
		createObstructionsFromConfig: function createObstructionsFromConfig(obstructions) {
			var x1, y1, x2, y2, x3, y3, x4, y4, //Clockwise coordinates(in terms of number of points) starting from top left.
				i, j, k;

			function getDimensionsOfObstruction(obstruction) {
				var coords = obstruction.coords,
					x1, y1, x2, y2, x3, y3, x4, y4; //Clockwise coordinates(in terms of number of points) starting from top left.
				x1 = coords.x;
				y1 = coords.y;
				x2 = x1 + coords.width;
				y2 = y1;
				x3 = x2;
				y3 = y2 + coords.height;
				x4 = x1;
				y4 = y1 + coords.height;

				return {
					x1: x1,
					y1: y1,
					x2: x2,
					y2: y2,
					x3: x3,
					y3: y3,
					x4: x4,
					y4: y4
				};
			}

			for (i = 0; i < obstructions.length; i++) {
				var obstruction = obstructions[i],
					coords = obstruction.coords,
					tCoords = obstruction.tCoords,
					/* obstructionType = obstruction.type, */
					obstructionDimensions = getDimensionsOfObstruction(obstruction);

				//Following are in terms of number of pellets
				obstruction.x1 = obstructionDimensions.x1;
				obstruction.y1 = obstructionDimensions.y1;
				obstruction.x2 = obstructionDimensions.x2;
				obstruction.y2 = obstructionDimensions.y2;
				obstruction.x3 = obstructionDimensions.x3;
				obstruction.y3 = obstructionDimensions.y3;
				obstruction.x4 = obstructionDimensions.x4;
				obstruction.y4 = obstructionDimensions.y4;

				this.occupyPossiblePelletsInObstruction(obstruction);
				//if (obstructionType === Obstruction.TypeEnum.T_SHAPED) {
					//tCoords = calculateTCoordinates(x1, x2, x3, x4, y1, y2, y3, y4, tCoords);
					//for (j = tCoords.x1; j <= tCoords.x2; j++) {
						//for (k = tCoords.y1; k <= tCoords.y4; k++) {
							//x = (2 * j - 1) * config.pelletSize / 2;
							//y = (2 * k - 1) * config.pelletSize / 2;
							//matrix[x + ',' + y] = new PlottablePoint(PlottablePoint.TypeEnum.OBSTRUCTION, obstruction);
						//}
					//}
				//}
				drawObstruction(coords.x, coords.y, coords.width, coords.height, tCoords);
			}
		},
		occupyPossiblePelletsInObstruction: function occupyPossiblePelletsInObstruction(obstruction) {
			var ix = obstruction.x1,
				jy;
			while (ix <= obstruction.x2) {
				jy = obstruction.y1;
				while (jy <= obstruction.y4) {
					this.addToMatrix(ix, jy, PlottablePoint.TypeEnum.OBSTRUCTION, obstruction);
					jy++;
				}
				ix++;
			}
		}
	};
	world.addDirectionsForPacman();
	window.world = world;
	return world;
});
