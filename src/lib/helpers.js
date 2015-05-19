export function $ (selector) {
	'use strict';
	return document.querySelectorAll(selector);
}

export function getRandomInt (min, max) {
	'use strict';
	return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomBoolean () {
	'use strict';
	return Math.random() < 0.5;
}
