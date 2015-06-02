import THREE from 'three';
import ShipPart from './ShipPart';


export const TILE_SIZE = 1;
export const TILE_HEIGHT = 0.5;
export const TILE_GEOMETRY = getGeometry();
export const TILE_MATERIALS = getMaterials();

export default class Tile extends THREE.Mesh {

	constructor (playerModel, coordinate) {
		super(TILE_GEOMETRY, TILE_MATERIALS.default);

		this.name = 'tile';
		this.receiveShadow = true;

		let hasShipPart = playerModel.board.hasShipPartAtCoordinate(coordinate);

		if (hasShipPart) {
			this.shipPart = new ShipPart(playerModel);
			this.add(this.shipPart);
		}

		this.translateY(TILE_HEIGHT/2);
	}

	markAsMissed () {
		this.material = TILE_MATERIALS.missed;
	}

}


function getGeometry () {
	'use strict';
	return new THREE.BoxGeometry(TILE_SIZE, TILE_HEIGHT, TILE_SIZE);
}

function getMaterials () {
	'use strict';

	return {
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
}
