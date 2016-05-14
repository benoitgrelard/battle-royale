import Model from '../lib/Model';
import ShipPart from './ShipPart';


/**
 * @class Ship
 */
export default class Ship extends Model {

	constructor(props) {
		const finalProps = Object.assign({
			name: 'Default Ship Name',
			size: 0,
			parts: []
		}, props);

		super(finalProps);

		this.parts = this.initParts(this, this.size);
	}

	initParts(ship, size) {
		const parts = [];
		for (let i = 0; i < size; i++) {
			parts[i] = new ShipPart({ ship });
		}
		return parts;
	}

	getPartAtIndex(index) {
		return this.parts[index];
	}

	isIntact() {
		return this.parts.every(part => part.isIntact());
	}

	isHit() {
		return this.parts.some(part => part.isHit());
	}

	isSunk() {
		return this.parts.every(part => part.isHit());
	}

}
