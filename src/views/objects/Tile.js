import THREE from 'three';
import ShipPart from './ShipPart';


export const TILE_SIZE = 1;

export const TILE_HEIGHT = 0.5;

export const TILE_GEOMETRY = new THREE.BoxGeometry(TILE_SIZE, TILE_HEIGHT, TILE_SIZE);

export const TILE_MATERIALS = {
	default: new THREE.MeshLambertMaterial({
		color: 'grey',
		emissive: 'rgb(5, 1, 4)',
		shading: THREE.FlatShading
	}),

	missed: new THREE.MeshLambertMaterial({
		color: 'cyan',
		emissive: 0x009999,
		shading: THREE.FlatShading,
		transparent: true,
		opacity: 0.2
	})
};

/**
 * @class Tile
 */
export default class Tile extends THREE.Mesh {

	constructor(playerModel, coordinate) {
		super(TILE_GEOMETRY, TILE_MATERIALS.default);

		this.name = 'tile';

		const hasShipPart = playerModel.board.hasShipPartAtCoordinate(coordinate);

		if (hasShipPart) {
			this.shipPart = new ShipPart(playerModel);
			this.shipPart.translateY(TILE_HEIGHT / 2);
			this.add(this.shipPart);
		}

		this.translateY(TILE_HEIGHT / 2);
	}

	markAsMissed() {
		this.material = TILE_MATERIALS.missed;
	}

}
