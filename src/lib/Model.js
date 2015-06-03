import EventEmitter from './EventEmitter';



/**
 * @class Model
 */
export default class Model extends EventEmitter {

	constructor (attributes) {
		super();

		this._$createGettersAndSetters(attributes);
	}

	_$createGettersAndSetters (attributes) {
		for (let attributeKey in attributes) {

			Object.defineProperty(this, attributeKey, {
				get: function() {
					return attributes[attributeKey];
				},
				set: function(value) {
					let oldValue = this[attributeKey];

					if (!this._$attributeHasChanged(value, oldValue)) { return; }

					// set value
					attributes[attributeKey] = value;

					// emit change events
					let eventPayload = {
						newValue: value,
						oldValue,
						attribute: attributeKey
					};
					this
						.emit('changed', eventPayload)
						.emit(`changed:${attributeKey}`, eventPayload);

					return this;
				}
			});

			// set initial value
			let attributeValue = attributes[attributeKey];
			this[attributeKey] = attributeValue;
		}
	}

	_$attributeHasChanged (value, oldValue) {
		// TODO: will only work for primitives or references
		return value !== oldValue;
	}

}
