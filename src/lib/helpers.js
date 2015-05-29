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

export function log3d (object) {
	'use strict';

	logLevel(object);

	function logLevel (object) {
		let hasChildren = object.children.length;
		let log = `[${object.type}]${object.name ? ' ' + object.name : ''}`;

		if (hasChildren) {
			window.console.groupCollapsed(log);
		} else {
			window.console.log(log);
		}

		object.children.map(child => logLevel(child));

		if (hasChildren) {
			window.console.groupEnd(log);
		}
	}
}
