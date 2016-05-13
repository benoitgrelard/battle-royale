export function $(selector) {
	return document.querySelectorAll(selector);
}

export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomBoolean() {
	return Math.random() < 0.5;
}

export function log3d(rootObject) {
	function logLevel(object) {
		const hasChildren = object.children.length;
		const name = object.name ? ` ${object.name}` : '';
		const log = `[${object.type}]${name}`;

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

	logLevel(rootObject);
}
