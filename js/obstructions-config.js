define([ 'Obstruction' ], function (Obstruction) {
	'use strict';
	//In terms of number of points
	//x,y must be odd numbers.
	//Also, width and height must be even to make other unspecified corners
	//on odd places too.
	//As odd numbered place is for pellets.
	var obstructionsConfig = [
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 3,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 9,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 15,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 21,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 27,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 33,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 39,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 45,
					y: 13,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 29,
					y: 29,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.T_SHAPED,
			data: {
				coords: {
					x: 3,
					y: 53,
					width: 18,
					height: 2
				},
				tCoords: {
					orientation: Obstruction.TshapeOrientationEnum.TOP,
					distance: 10, //From top or left
					width: 2,
					height: 16
				}
			}
		},
		{
			type: Obstruction.TypeEnum.T_SHAPED,
			data: {
				coords: {
					x: 37,
					y: 27,
					width: 2,
					height: 10
				},
				tCoords: {
					orientation: Obstruction.TshapeOrientationEnum.RIGHT,
					distance: 10,
					width: 12,
					height: 2
				}
			}
		},
		{
			type: Obstruction.TypeEnum.T_SHAPED,
			data: {
				coords: {
					x: 11,
					y: 27,
					width: 12,
					height: 2
				},
				tCoords: {
					orientation: Obstruction.TshapeOrientationEnum.BOTTOM,
					distance: 8,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.T_SHAPED,
			data: {
				coords: {
					x: 39,
					y: 39,
					width: 2,
					height: 12
				},
				tCoords: {
					orientation: Obstruction.TshapeOrientationEnum.LEFT,
					distance: 2,
					width: 12,
					height: 2
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 25,
					y: 7,
					width: 20,
					height: 2
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 1,
					y: 39,
					width: 2,
					height: 10
				}
			}
		},
		{
			type: Obstruction.TypeEnum.RECTANGLE,
			data: {
				coords: {
					x: 7,
					y: 39,
					width: 2,
					height: 10
				}
			}
		},
	];
	return obstructionsConfig;
});