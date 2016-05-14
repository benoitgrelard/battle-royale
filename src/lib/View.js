import EventEmitter from './EventEmitter';


/**
 * @class View
 */
export default class View extends EventEmitter {

	constructor(model, element = document.body) {
		super();

		this.model = model;
		this.rootElement = element;
	}

	delegate(eventName, selector, callback) {
		this.rootElement.addEventListener(eventName, event => {
			const isClassName = selector.charAt(0) === '.';
			if (isClassName && event.target.classList.contains(selector.replace('.', ''))) {
				callback(event);
			}
		});
	}

}
