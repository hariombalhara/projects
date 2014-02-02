define([ 'PlottablePoint', 'Obstruction', 'obstructions-config', 'pacman-config' ], function (PlottablePoint, Obstruction, obstructionsConfig, config) {
	'use strict';
	var canvas = document.querySelector('canvas'),
		canvasContext = canvas.getContext('2d'),
		pi = 3.14,
		pacman = {};

	function drawPellet (cx, cy, r) {
		canvasContext.fillStyle = 'grey';
		canvasContext.beginPath();
		canvasContext.arc(cx, cy, r, 0, 2 * pi);
		canvasContext.fill();
	}

	function drawObstruction (x, y, width, height, tCoords) {
		canvasContext.lineWidth = config.obstructionStrokeWidth;
		canvasContext.fillStyle = 'blue';
		canvasContext.fillRect(x, y, width, height);
		if (tCoords) {
			canvasContext.fillRect(tCoords.x1 * config.pointSize, tCoords.y1 * config.pointSize, (tCoords.x2 - tCoords.x1) * config.pointSize, (tCoords.y3 - tCoords.y2) * config.pointSize);
		}
	}

	function calculateTCoordinates (x1, x2, x3, x4, y1, y2, y3, y4, tCoords) {
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
			y4: y4,
		};
	}

	function processObstructions (matrix, obstructions, size) {
		var x1, y1, x2, y2, x3, y3, x4, y4, //Clockwise coordinates(in terms of number of points) starting from top left.
			i, j, k;
		for (i = 0; i < obstructions.length; i++) {
			var coords = obstructions[i].data.coords,
				tCoords = obstructions[i].data.tCoords,
				obstructionType = obstructions[i].type;
			x1 = coords.x;
			y1 = coords.y;
			x2 = x1 + coords.width;
			y2 = y1;
			x3 = x2;
			y3 = y2 + coords.height;
			x4 = x1;
			y4 = y1 + coords.height;

			for (j = x1; j <= x2; j++) {
				for(k = y1; k <= y4; k++) {
					matrix[j + ',' + k] = new PlottablePoint(PlottablePoint.TypeEnum.OBSTRUCTION, size, obstructions[i]);
				}
			}
			if (obstructionType === Obstruction.TypeEnum.T_SHAPED) {
				tCoords = calculateTCoordinates (x1, x2, x3, x4, y1, y2, y3, y4, tCoords);
				for (j = tCoords.x1; j <= tCoords.x2; j++) {
					for(k = tCoords.y1; k <= tCoords.y4; k++) {
						matrix[j + ',' + k] = new PlottablePoint(PlottablePoint.TypeEnum.OBSTRUCTION, size, obstructions[i]);
					}
				}
			}
			drawObstruction(coords.x * size, coords.y * size, coords.width * size, coords.height * size, tCoords);
		}
	}
	pacman = {
		matrix: {},
		createFloorMatrix: function (numberOfPointsAlongX, numberOfPointsAlongY, obstructions) {
			var type,
				size = config.pointSize,
				radius = size/4;

			canvas.height = config.pointSize * numberOfPointsAlongY;
			canvas.width = config.pointSize * numberOfPointsAlongX;

			processObstructions(this.matrix, obstructions, size);

			for (var i = 0; i < numberOfPointsAlongX; i++) {
				for (var j = 0; j < numberOfPointsAlongY; j++) {
					if (this.matrix[i + ',' + j]) {
						continue;
					}
					if (i % 2 !== 0 && j % 2 !== 0) {
						type = PlottablePoint.TypeEnum.PELLET;
						drawPellet(i * size, j * size, radius, 0, 2 * pi);
					} else {
						//drawPellet(i * size, j * size, radius, 0, 2 * pi);
						type = PlottablePoint.TypeEnum.EMPTY;
					}
					this.matrix[i + ',' + j] = new PlottablePoint(type, size);
				}
			}
		},
		init:  function () {
			this.createFloorMatrix(config.numberOfPointsAlongX, config.numberOfPointsAlongY, obstructionsConfig);
		}
	};
	return pacman;
});