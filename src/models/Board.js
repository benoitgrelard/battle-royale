import Model from 'src/lib/Model';
import Coordinate from 'src/models/Coordinate';
import ShipPart from 'src/models/ShipPart';
import { CONST_CELL_INIT, CONST_CELL_MISSED, EVENT_SHOT } from 'src/constants';


/**
 * @class Board
 */
export default class Board extends Model {

	constructor (attributes) {
		super(Object.assign({
			size: 0,
			grid: []
		}, attributes));

		this.grid = initGrid(this.size);

		function initGrid(size) {
			let grid = new Array(size);
			for (let x=0; x<size; x++) {
				grid[x] = new Array(size);
				for (let y=0; y<size; y++) {
					grid[x][y] = CONST_CELL_INIT;
				}
			}
			return grid;
		}
	}

	deployShip (ship, startCoordinate, direction) {
		if (!this.canPlaceShip(ship, startCoordinate, direction)) { return false; }

		let { x: xStart, y: yStart } = startCoordinate;

		if (direction === 'x') {
			for (let x = xStart, partIndex = 0; x < xStart + ship.size; x++, partIndex++) {
				let coordinate = new Coordinate({ x, y: yStart });
				this.setAtCoordinate(coordinate, ship.getPartAtIndex(partIndex));
			}
		}

		if (direction === 'y') {
			let yEnd = yStart + ship.size;
			if (yEnd > this.size - 1) { return false; }
			for (let y = yStart, partIndex = 0; y < yStart + ship.size; y++, partIndex++) {
				let coordinate = new Coordinate({ x: xStart, y });
				this.setAtCoordinate(coordinate, ship.getPartAtIndex(partIndex));
			}
		}

		return true;
	}

	canPlaceShip (ship, startCoordinate, direction) {
		let { x: xStart, y: yStart } = startCoordinate;
		if (direction === 'x') {
			let xEnd = xStart + ship.size;
			if (xEnd > this.size - 1) { return false; }
			for (let x = xStart; x < xEnd; x++) {
				let coordinate = new Coordinate({ x, y: yStart });
				if (this.hasShipPartAtCoordinate(coordinate)) { return false; }
			}
		}

		if (direction === 'y') {
			let yEnd = yStart + ship.size;
			if (yEnd > this.size - 1) { return false; }
			for (let y = yStart; y < yEnd; y++) {
				let coordinate = new Coordinate({ x: xStart, y });
				if (this.hasShipPartAtCoordinate(coordinate)) { return false; }
			}
		}

		return true;
	}

	getAtCoordinate (coordinate) {
		let { x, y } = coordinate;
		return this.grid[x][y];
	}

	setAtCoordinate (coordinate, value) {
		let { x, y } = coordinate;
		this.grid[x][y] = value;
	}

	hasShipPartAtCoordinate (coordinate) {
		return this.getAtCoordinate(coordinate) instanceof ShipPart;
	}

	isCellMissed (coordinate) {
		return this.getAtCoordinate(coordinate) === CONST_CELL_MISSED;
	}

	takeHit (coordinate) {
		let hasShipPart = this.hasShipPartAtCoordinate(coordinate);
		let cellContent = this.getAtCoordinate(coordinate);
		let alreadyHit = this.isCellMissed(coordinate) || (hasShipPart && !cellContent.isIntact());

		if (alreadyHit) { return false; }

		let hit = false;
		let sunk = false;
		let ship = null;

		if (!hasShipPart) {
			this.setAtCoordinate(coordinate, CONST_CELL_MISSED);
		} else {
			let shipPart = cellContent;
			shipPart.takeHit();
			hit = true;
			ship = shipPart.getShip();
			sunk = ship.isSunk();
		}

		let result = { coordinate, hit, sunk, ship };

		this.emit(EVENT_SHOT, result);

		return result;
	}

}
