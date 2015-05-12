import Coordinate from 'src/models/Coordinate';
import { getRandomInt } from 'src/lib/helpers';

/**
 * @class AI
 */
export default class AI {

	constructor (boardSize) {
		this.boardSize = boardSize;
		this.hitMap = initHitMap(this.boardSize);

		function initHitMap(size) {
			let hitMap = new Array(size);
			for (let x=0; x<size; x++) {
				hitMap[x] = new Array(size);
				for (let y=0; y<size; y++) {
					hitMap[x][y] = {
						coordinate: new Coordinate(x, y),
						tried: false,
						hit: false,
						sunk: false
					};
				}
			}
			return hitMap;
		}
	}

	chooseCoordinate () {
		let cellsNotTried = this.getFlattenedHitMap().filter(cell => cell.tried === false);
		let index = getRandomInt(0, cellsNotTried.length - 1);
		let chosenCell = cellsNotTried[index];
		chosenCell.tried = true;
		return chosenCell.coordinate;
	}

	updateCoordinateResults (coordinate, hit, sunk) {
		let { x, y } = coordinate;
		let cell = this.hitMap[x][y];
		cell.hit = hit;
		cell.sunk = sunk;
	}

	getFlattenedHitMap () {
		return this.hitMap.reduce((flattenedHitMap, column) => flattenedHitMap.concat(column), []);
	}

}
