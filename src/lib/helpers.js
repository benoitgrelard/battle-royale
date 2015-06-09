export function $ (selector) {
	return document.querySelectorAll(selector);
}

export function getRandomInt (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomBoolean () {
	return Math.random() < 0.5;
}

export function log3d (rootObject) {

	logLevel(rootObject);


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
