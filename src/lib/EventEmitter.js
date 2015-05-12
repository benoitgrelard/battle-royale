/**
 * @class EventEmitter
 */
export default class EventEmitter {

	constructor () {
		this._listeners = [];
	}

	on (eventName, callback) {
		this._listeners.push({
			name: eventName,
			callback: callback
		});
	}

	off (eventName, callback) {
		this._listeners.forEach((listener, index) => {
			if (listener.name === eventName && listener.callback === callback) {
				this._listeners.splice(index, 1);
			}
		});
	}

	emit (eventName, data) {
		this._listeners
			.filter(listener => listener.name === eventName)
			.forEach(listener => listener.callback(eventName, data));
	}

	proxy (eventName, data) {
		this.emit(eventName, data);
	}

}
