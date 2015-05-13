/**
 * @class EventEmitter
 */
export default class EventEmitter {

	constructor () {
		this._$listeners = [];
	}

	on (eventName, callback) {
		this._$listeners.push({
			name: eventName,
			callback: callback
		});
		return this;
	}

	off (eventName, callback) {
		this._$listeners.forEach((listener, index) => {
			if (listener.name === eventName && listener.callback === callback) {
				this._$listeners.splice(index, 1);
			}
		});
		return this;
	}

	emit (eventName, data) {
		this._$listeners
			.filter(listener => listener.name === eventName)
			.forEach(listener => listener.callback(eventName, data, this));
		return this;
	}

	proxy (eventName, data) {
		return this.emit(eventName, data);
	}

}
