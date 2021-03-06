import Obstruction from './Obstruction'
'use strict';
// data is obstructionConfig in case of obstruction otherwise its size
function PlottablePoint(type, data) {
	this.type = type || PlottablePoint.TypeEnum.EMPTY;
	if (type === PlottablePoint.TypeEnum.OBSTRUCTION) {
		this.obstruction = new Obstruction(data);
	} else if (type === PlottablePoint.TypeEnum.PELLET) {
		this.size = data;
	}
}

PlottablePoint.TypeEnum = {
	EMPTY: 'empty',
	PELLET: 'pellet',
	OBSTRUCTION: 'obstruction'
};

PlottablePoint.prototype.markEmpty = function () {
	this.type = PlottablePoint.TypeEnum.EMPTY;
};
export default PlottablePoint;