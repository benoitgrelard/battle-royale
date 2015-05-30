import THREE from 'three';


export const TILE_SIZE = 1;
export const TILE_HEIGHT = 0.5;
export const SHIP_PART_SIZE = 0.75;
export const MISSILE_SIZE = 0.3;
export const MISSILE_HEIGHT = 0.75;
export default {
	tile: getTile(),
	shipPart: getShipPart(),
	missile: getMissile(),
	missileLine: getMissileLine()
};


function getTile() {
	'use strict';
	return new THREE.BoxGeometry(TILE_SIZE, TILE_HEIGHT, TILE_SIZE);
}

function getShipPart() {
	'use strict';
	return new THREE.IcosahedronGeometry(SHIP_PART_SIZE/2, 1);
}

function getMissile() {
	'use strict';
	return new THREE.CylinderGeometry(MISSILE_SIZE, 0, MISSILE_HEIGHT, 4, 1);
}

function getMissileLine() {
	'use strict';

	let lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(
		new THREE.Vector3(0, 1000, 0),
		new THREE.Vector3(0, -1000, 0)
	);

	return lineGeometry;
}
