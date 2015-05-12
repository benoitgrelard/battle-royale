import EventEmitter from 'src/lib/EventEmitter';

/**
 * @class View
 */
export default class View extends EventEmitter {

	constructor (model, element = document.body) {
		super();

		this.model = model;
		this.rootElement = element;
	}

	delegate (eventName, selector, callback) {
		this.rootElement.addEventListener(eventName, handleEvent);

		function handleEvent (event) {
			let isClassName = selector.charAt(0) === '.';
			if (isClassName && event.target.classList.contains(selector.replace('.', ''))) {
				callback(event);
			}
		}
	}

}
