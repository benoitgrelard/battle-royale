import THREE from 'three';


export const TILE_SIZE = 1;
export const TILE_HEIGHT = 0.5;
export default {
	tile: getTile()
};


function getTile() {
	'use strict';
	return new THREE.BoxGeometry(TILE_SIZE, TILE_HEIGHT, TILE_SIZE);
}
