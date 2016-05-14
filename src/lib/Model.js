import EventEmitter from './EventEmitter';


/**
 * @class Model
 */
export default class Model extends EventEmitter {

	constructor(props) {
		super();

		this._props = props;
		this._createGettersAndSetters();
	}

	_createGettersAndSetters() {
		Object.keys(this._props).forEach(propKey => {
			Object.defineProperty(this, propKey, {

				get() {
					return this._props[propKey];
				},

				set(value) {
					const oldValue = this._props[propKey];

					if (!this._propHasChanged(value, oldValue)) { return this; }

					// set value
					this._props[propKey] = value;

					// emit change events
					const eventPayload = {
						newValue: value,
						oldValue,
						prop: propKey
					};

					this.emit('changed', eventPayload);
					this.emit(`changed:${propKey}`, eventPayload);

					return this;
				}

			});
		});
	}

	_propHasChanged(value, oldValue) {
		// TODO: will only work for primitives or references
		return value !== oldValue;
	}

}
