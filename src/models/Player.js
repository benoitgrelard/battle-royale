import Model from '../lib/Model';
import Board, { DEFAULT_BOARD_SIZE } from './Board';
import Ship from './Ship';
import Coordinate from './Coordinate';
import { getRandomBoolean } from '../lib/helpers';
import { MODEL_EVENT__SHOT } from '../constants';


/**
 * @class Player
 */
export default class Player extends Model {

	constructor(props) {
		const finalProps = Object.assign({
			name: 'Default Player Name',
			type: null,
			boardSize: DEFAULT_BOARD_SIZE,
			board: new Board({ size: DEFAULT_BOARD_SIZE }),
			fleet: [
				new Ship({ name: 'Aircraft Carrier', size: 5 }),
				new Ship({ name: 'Battleship', size: 4 }),
				new Ship({ name: 'Destroyer', size: 3 }),
				new Ship({ name: 'Submarine', size: 3 }),
				new Ship({ name: 'Patrol Boat', size: 2 })
			],
			isActive: false,
			canPlay: false
		}, props);

		super(finalProps);

		this.deployFleet();

		// proxy `MODEL_EVENT__SHOT` events from board
		this.board.on(MODEL_EVENT__SHOT, this.proxy.bind(this));
	}

	deployFleet() {
		this.fleet.forEach(this.deployShip.bind(this));
	}

	deployShip(ship) {
		let isDeployed = false;
		let startCoordinate = null;
		let direction = null;

		do {
			startCoordinate = Coordinate.random(this.boardSize);
			direction = getRandomBoolean() ? 'x' : 'y';
			isDeployed = this.board.deployShip(ship, startCoordinate, direction);
		} while (
			isDeployed === false
		);
	}

	isSunk() {
		return this.fleet.every(ship => ship.isSunk());
	}

	takeHit(coordinate) {
		if (this.isActive) { return null; }
		return this.board.takeHit(coordinate);
	}

	getDamages() {
		return this.fleet.reduce((totalDamages, ship) => totalDamages + ship.getDamages(), 0);
	}

}
