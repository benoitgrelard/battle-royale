import Model from 'src/lib/Model';
import ShipPart from 'src/models/ShipPart';


/**
 * @class Ship
 */
export default class Ship extends Model {

	constructor (attributes) {
		super(Object.assign({
			name: 'Default Name',
			size: 0,
			parts: []
		}, attributes));

		this.parts = initParts(this, this.size);

		function initParts(ship, size) {
			let parts = [];
			for (let i=0; i<size; i++) {
				parts[i] = new ShipPart({ ship });
			}
			return parts;
		}
	}

	getPartAtIndex (index) {
		return this.parts[index];
	}

	isIntact () {
		return this.parts.every(part => part.isIntact());
	}

	isHit () {
		return this.parts.some(part => part.isHit());
	}

	isSunk () {
		return this.parts.every(part => part.isHit());
	}

}
