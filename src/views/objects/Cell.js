import THREE from 'three';
import CellSide from './CellSide';


/**
 * @class Cell
 */
export default class Cell extends THREE.Group {

	constructor(gameModel, coordinate) {
		super();

		this.name = 'cellPivot';

		this.cell = new THREE.Group();
		this.cell.name = 'cell';
		const { x, y } = coordinate;
		this.cell.userData = { x, y };

		this.humanSide = new CellSide(gameModel.humanPlayer, coordinate);
		this.computerSide = new CellSide(gameModel.computerPlayer, coordinate);
		this.computerSide.rotateX(Math.PI);

		this.cell.add(this.humanSide, this.computerSide);
		this.add(this.cell);
	}

	getSide(player) {
		return player.type === 'human' ? this.humanSide : this.computerSide;
	}

}
