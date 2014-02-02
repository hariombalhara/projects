define([ 'Obstruction', 'pacman-config' ], function (Obstruction, config) {
	'use strict';
	function PlottablePoint (type, size, obstructionConfig) {
		this.type = type || PlottablePoint.TypeEnum.EMPTY;
		this.size = size || config.pointSize;
		if (type == PlottablePoint.TypeEnum.OBSTRUCTION) {
			this.obstruction = new Obstruction(obstructionConfig);
		}
	}

	PlottablePoint.TypeEnum = {
		EMPTY: 'empty',
		PELLET: 'pellet',
		OBSTRUCTION: 'obstruction'
	};

	return PlottablePoint;
});