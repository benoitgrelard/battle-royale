import EventEmitter from './EventEmitter';


/**
 * @class Model
 */
export default class Model extends EventEmitter {

	constructor(attributes) {
		super();

		this._$createGettersAndSetters(attributes);
	}

	_$createGettersAndSetters(attributes) {
		/* eslint-disable guard-for-in, no-restricted-syntax */
		for (const attributeKey in attributes) {
		/* eslint-enable guard-for-in */

			Object.defineProperty(this, attributeKey, {
				get() {
					return attributes[attributeKey];
				},
				set(value) {
					const oldValue = this[attributeKey];

					if (!this._$attributeHasChanged(value, oldValue)) { return this; }

					// set value
					attributes[attributeKey] = value; // eslint-disable-line

					// emit change events
					const eventPayload = {
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
			const attributeValue = attributes[attributeKey];
			this[attributeKey] = attributeValue;
		}
	}

	_$attributeHasChanged(value, oldValue) {
		// TODO: will only work for primitives or references
		return value !== oldValue;
	}

}
