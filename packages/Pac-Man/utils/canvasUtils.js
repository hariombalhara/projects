define([], function () {
	'use strict';
	var canvasUtils = {
		drawRoundedCornerRectangle: function (canvasContext, x, y, width, height, cornerRadius) {
			if (width < 2 * cornerRadius) {
				cornerRadius = width / 2;
			}
			if (height < 2 * cornerRadius) {
				cornerRadius = height / 2;
			}
			canvasContext.beginPath();
			canvasContext.moveTo(x + cornerRadius, y);
			canvasContext.arcTo(x + width, y, x + width, y + height, cornerRadius);
			canvasContext.arcTo(x + width, y + height, x, y + height, cornerRadius);
			canvasContext.arcTo(x, y + height, x, y - cornerRadius, cornerRadius);
			canvasContext.arcTo(x, y, x + width, y, cornerRadius);
			canvasContext.closePath();
			return canvasContext;
		}
	};
	return canvasUtils;
});
