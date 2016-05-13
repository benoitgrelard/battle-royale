import Model from '../lib/Model';
import Coordinate from './Coordinate';
import ShipPart from './ShipPart';
import { CELL_INIT, CELL_MISSED, MODEL_EVENT__SHOT } from '../constants';


export const DEFAULT_BOARD_SIZE = 10;

/**
 * @class Board
 */
export default class Board extends Model {

	constructor(attributes) {
		super(Object.assign({
			size: DEFAULT_BOARD_SIZE,
			grid: []
		}, attributes));

		this.grid = this.initGrid(this.size);
	}

	initGrid(size) {
		const grid = new Array(size);
		for (let x = 0; x < size; x++) {
			grid[x] = new Array(size);
			for (let y = 0; y < size; y++) {
				grid[x][y] = CELL_INIT;
			}
		}
		return grid;
	}

	deployShip(ship, startCoordinate, direction) {
		if (!this.canPlaceShip(ship, startCoordinate, direction)) { return false; }

		const { x: xStart, y: yStart } = startCoordinate;

		if (direction === 'x') {
			for (let x = xStart, partIndex = 0; x < xStart + ship.size; x++, partIndex++) {
				const coordinate = new Coordinate({ x, y: yStart });
				this.setAtCoordinate(coordinate, ship.getPartAtIndex(partIndex));
			}
		}

		if (direction === 'y') {
			const yEnd = yStart + ship.size;
			if (yEnd > this.size - 1) { return false; }
			for (let y = yStart, partIndex = 0; y < yStart + ship.size; y++, partIndex++) {
				const coordinate = new Coordinate({ x: xStart, y });
				this.setAtCoordinate(coordinate, ship.getPartAtIndex(partIndex));
			}
		}

		return true;
	}

	canPlaceShip(ship, startCoordinate, direction) {
		const { x: xStart, y: yStart } = startCoordinate;
		if (direction === 'x') {
			const xEnd = xStart + ship.size;
			if (xEnd > this.size - 1) { return false; }
			for (let x = xStart; x < xEnd; x++) {
				const coordinate = new Coordinate({ x, y: yStart });
				if (this.hasShipPartAtCoordinate(coordinate)) { return false; }
			}
		}

		if (direction === 'y') {
			const yEnd = yStart + ship.size;
			if (yEnd > this.size - 1) { return false; }
			for (let y = yStart; y < yEnd; y++) {
				const coordinate = new Coordinate({ x: xStart, y });
				if (this.hasShipPartAtCoordinate(coordinate)) { return false; }
			}
		}

		return true;
	}

	getAllShipPartCoordinates(ship) {
		const shipPartCoordinates = [];
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const coordinate = new Coordinate({ x, y });
				if (this.hasShipPartAtCoordinate(coordinate)) {
					const shipPart = this.getAtCoordinate(coordinate);
					if (shipPart.getShip().name === ship.name) {
						shipPartCoordinates.push({ x, y });
					}
				}
			}
		}
		return shipPartCoordinates;
	}

	getAtCoordinate(coordinate) {
		const { x, y } = coordinate;
		return this.grid[x][y];
	}

	setAtCoordinate(coordinate, value) {
		const { x, y } = coordinate;
		this.grid[x][y] = value;
	}

	hasShipPartAtCoordinate(coordinate) {
		return this.getAtCoordinate(coordinate) instanceof ShipPart;
	}

	isCellMissed(coordinate) {
		return this.getAtCoordinate(coordinate) === CELL_MISSED;
	}

	takeHit(coordinate) {
		const hasShipPart = this.hasShipPartAtCoordinate(coordinate);
		const cellContent = this.getAtCoordinate(coordinate);
		const alreadyHit = this.isCellMissed(coordinate) || (hasShipPart && !cellContent.isIntact());

		if (alreadyHit) { return false; }

		let hit = false;
		let sunk = false;
		let ship = null;

		if (!hasShipPart) {
			this.setAtCoordinate(coordinate, CELL_MISSED);
		} else {
			const shipPart = cellContent;
			shipPart.takeHit();
			hit = true;
			ship = shipPart.getShip();
			sunk = ship.isSunk();
		}

		const result = { coordinate, hit, sunk, ship };

		this.emit(MODEL_EVENT__SHOT, result);

		return result;
	}

}
