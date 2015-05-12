import Model from 'src/lib/Model';

/**
 * @class ShipPart
 */
export default class ShipPart extends Model {

	constructor (ship) {
		super();

		this.ship = ship;
		this.state = 1;
	}

	getShip () {
		return this.ship;
	}

	takeHit () {
		this.state = 0;
	}

	isIntact () {
		return this.state === 1;
	}

	isHit () {
		return this.state === 0;
	}

}
