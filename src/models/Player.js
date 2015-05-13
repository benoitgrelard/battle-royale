import Model from 'src/lib/Model';
import Board from 'src/models/Board';
import Ship from 'src/models/Ship';
import Coordinate from 'src/models/Coordinate';
import { getRandomBoolean } from 'src/lib/helpers';
import { EVENT_SHOT } from 'src/constants';


/**
 * @class Player
 */
export default class Player extends Model {

	constructor (attributes) {
		super(Object.assign({
			name: 'Default Name',
			boardSize: 10,
			board: new Board({ size: 10 }),
			fleet: [
				new Ship({ name: 'Aircraft Carrier', size: 5 }),
				new Ship({ name: 'Battleship', size: 4 }),
				new Ship({ name: 'Destroyer', size: 3 }),
				new Ship({ name: 'Submarine', size: 3 }),
				new Ship({ name: 'Patrol Boat', size: 2 })
			],
			activated: false
		}, attributes));

		this.deployFleet();

		// proxy `EVENT_SHOT` events from board
		this.board.on(EVENT_SHOT, this.proxy.bind(this));
	}

	deployFleet () {
		this.fleet.forEach(this.deployShip.bind(this));
	}

	deployShip (ship) {
		let isDeployed = false;
		let startCoordinate = null;
		let direction = null;

		do {

			startCoordinate = Coordinate.random(this.boardSize);
			direction = getRandomBoolean() ? 'x' : 'y';
			isDeployed = this.board.deployShip(ship, startCoordinate, direction);

		} while(isDeployed === false);
	}

	isSunk () {
		return this.fleet.every(ship => ship.isSunk());
	}

	takeHit (coordinate) {
		if (this.activated) { return; }
		return this.board.takeHit(coordinate);
	}

}
