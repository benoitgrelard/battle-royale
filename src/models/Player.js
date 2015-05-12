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

	constructor (name) {
		super();

		this.name = name;
		this.boardSize = 10;
		this.board = new Board(this.boardSize);
		this.fleet = [
			new Ship('Aircraft Carrier', 5),
			new Ship('Battleship', 4),
			new Ship('Destroyer', 3),
			new Ship('Submarine', 3),
			new Ship('Patrol Boat', 2)
		];
		this.activated = false;

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
		if (this.isActivated()) { return; }
		return this.board.takeHit(coordinate);
	}

	activate () {
		this.activated = true;
	}

	deactivate () {
		this.activated = false;
	}

	isActivated () {
		return this.activated === true;
	}

}
