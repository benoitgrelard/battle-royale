import Coordinate from '../models/Coordinate';
import { getRandomInt } from './helpers';


/**
 * @class AI
 */
export default class AI {

	constructor(boardSize) {
		this.boardSize = boardSize;
		this.hitMap = this.initHitMap(this.boardSize);
	}

	initHitMap(size) {
		const hitMap = new Array(size);
		for (let x = 0; x < size; x++) {
			hitMap[x] = new Array(size);
			for (let y = 0; y < size; y++) {
				hitMap[x][y] = {
					coordinate: new Coordinate({ x, y }),
					tried: false,
					hit: false,
					sunk: false
				};
			}
		}
		return hitMap;
	}

	chooseCoordinate() {
		const cellsNotTried = this.getFlattenedHitMap().filter(cell => cell.tried === false);
		const index = getRandomInt(0, cellsNotTried.length - 1);
		const chosenCell = cellsNotTried[index];
		return chosenCell.coordinate;
	}

	updateHitMapAtCoordinate(coordinate, hit, sunk) {
		const { x, y } = coordinate;
		const cell = this.hitMap[x][y];

		cell.tried = true;
		cell.hit = hit;
		cell.sunk = sunk;
	}

	getFlattenedHitMap() {
		return this.hitMap.reduce((flattenedHitMap, column) => flattenedHitMap.concat(column), []);
	}

}

export const CONST_AI_DELAY = 500;
