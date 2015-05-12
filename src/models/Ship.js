import Model from 'src/lib/Model';
import ShipPart from 'src/models/ShipPart';

/**
 * @class Ship
 */
export default class Ship extends Model {

	constructor (name, size) {
		super();

		this.name = name;
		this.size = size;
		this.parts = initParts(this, size);

		function initParts(ship, size) {
			let parts = [];
			for (let i=0; i<size; i++) {
				parts[i] = new ShipPart(ship);
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
