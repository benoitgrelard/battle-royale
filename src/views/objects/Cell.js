import THREE from 'three';
import CellSide from './CellSide';



/**
 * @class Cell
 */
export default class Cell extends THREE.Group {

	constructor (gameModel, coordinate) {
		super();

		this.name = 'cellPivot';

		this.cell = new THREE.Group();
		this.cell.name = 'cell';
		let { x, y } = coordinate;
		this.cell.userData = { x, y };

		this.humanCellSide = new CellSide(gameModel.humanPlayer, coordinate);
		this.computerCellSide = new CellSide(gameModel.computerPlayer, coordinate);
		this.computerCellSide.rotateX(Math.PI);

		this.cell.add(this.humanCellSide, this.computerCellSide);
		this.add(this.cell);
	}

	getCellSide (player) {
		return player.type === 'human' ? this.humanCellSide : this.computerCellSide;
	}

}
