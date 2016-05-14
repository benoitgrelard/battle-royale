/**
 * @class EventEmitter
 */
export default class EventEmitter {

	constructor() {
		this._listeners = [];
	}

	on(eventName, callback) {
		this._listeners.push({
			name: eventName,
			callback
		});
		return this;
	}

	off(eventName, callback) {
		this._listeners.forEach((listener, index) => {
			if (listener.name === eventName && listener.callback === callback) {
				this._listeners.splice(index, 1);
			}
		});
		return this;
	}

	emit(eventName, data) {
		this._listeners
			.filter(listener => listener.name === eventName)
			.forEach(listener => listener.callback(eventName, data, this));
		return this;
	}

	proxy(eventName, data) {
		return this.emit(eventName, data);
	}

}
