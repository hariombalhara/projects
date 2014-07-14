define([], function () {
	'use strict';
	function Obstruction(config) {
		this.type = config.type || Obstruction.TypeEnum.RECTANGLE;
		this.data = config.data;
	}

	Obstruction.TypeEnum = {
		RECTANGLE: 'rectangle',
		T_SHAPED: 'tShaped'
	};

	Obstruction.TshapeOrientationEnum = {
		TOP: 'top',
		LEFT: 'left',
		RIGHT: 'right',
		BOTTOM: 'bottom'
	};
	return Obstruction;
});
