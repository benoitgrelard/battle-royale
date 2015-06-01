import THREE from 'three';


export const TILE_SIZE = 1;
export const TILE_HEIGHT = 0.5;
export const SHIP_PART_SIZE = 0.75;
export default {
	tile: getTile(),
	shipPart: getShipPart()
};


function getTile() {
	'use strict';
	return new THREE.BoxGeometry(TILE_SIZE, TILE_HEIGHT, TILE_SIZE);
}

function getShipPart() {
	'use strict';
	return new THREE.IcosahedronGeometry(SHIP_PART_SIZE/2, 1);
}
