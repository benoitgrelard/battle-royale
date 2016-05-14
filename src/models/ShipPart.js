import Model from '../lib/Model';


export const HIT = 'HIT';
export const INTACT = 'INTACT';

/**
 * @class ShipPart
 */
export default class ShipPart extends Model {

	constructor(props) {
		const finalProps = Object.assign({
			ship: null,
			state: INTACT
		}, props);

		super(finalProps);
	}

	getShip() {
		return this.ship;
	}

	takeHit() {
		this.state = HIT;
	}

	isIntact() {
		return this.state === INTACT;
	}

	isHit() {
		return this.state === HIT;
	}

}
