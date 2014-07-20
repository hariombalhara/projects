define([ 'Obstruction' ], function (Obstruction) {
	'use strict';
	// In terms of number of points
	// x,y must be odd numbers.
	// Also, width and height must be even to make other unspecified corners
	// on odd places too.
	// As odd numbered place is for pellets.
	var obstructionsConfig = [
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			coords: {
				x: 1,
				y: 1,
				width: 3,
				height: 2
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			coords: {
				x: 6,
				y: 1,
				width: 4,
				height: 2
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			coords: {
				x: 12,
				y: 0,
				width: 1,
				height: 3
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			coords: {
				x: 15,
				y: 1,
				width: 4,
				height: 2
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			coords: {
				x: 21,
				y: 1,
				width: 3,
				height: 2
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			coords: {
				x: 1,
				y: 5,
				width: 3,
				height: 1
			}
		},
		{
			type: Obstruction.TypeEnum.T_SHAPED,
			coords: {
				x: 6,
				y: 5,
				width: 1,
				height: 7
			},
			tCoords: {
				orientation: Obstruction.TshapeOrientationEnum.RIGHT,
				distance: 3, //From top or left
				width: 3,
				height: 1
			}
		},
		{
			type: Obstruction.TypeEnum.T_SHAPED,
			coords: {
				x: 9,
				y: 5,
				width: 7,
				height: 1
			},
			tCoords: {
				orientation: Obstruction.TshapeOrientationEnum.BOTTOM,
				distance: 3,
				width: 1,
				height: 3
			}
		},
		{
			type: Obstruction.TypeEnum.T_SHAPED,
			coords: {
				x: 18,
				y: 5,
				width: 1,
				height: 7
			},
			tCoords: {
				orientation: Obstruction.TshapeOrientationEnum.LEFT,
				distance: 3,
				width: 3,
				height: 1
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			coords: {
				x: 21,
				y: 5,
				width: 3,
				height: 1
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE, //SPECIAL LEFT
			coords: {
				x: 0,
				y: 7,
				width: 4,
				height: 4
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE, //SPECIAL RIGHT
			coords: {
				x: 21,
				y: 7,
				width: 4,
				height: 4
			}
		}
	];
	return obstructionsConfig;
});
