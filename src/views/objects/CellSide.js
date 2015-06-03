import THREE from 'three';
import Tile from './Tile';



/**
 * @class CellSide
 */
export default class CellSide extends THREE.Group {

	constructor (playerModel, coordinate) {
		super();

		this.name = `cellSide--${playerModel.type}`;
		this.tile = new Tile(playerModel, coordinate);
		this.add(this.tile);
	}

}
