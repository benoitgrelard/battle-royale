import THREE from 'three';


export const CELL_SIZE = 1;
export const CELL_HEIGHT = 1;
export const SHIP_PART_SIZE = 0.75;
export default {
	cell: getCell(),
	shipPart: getShipPart()
};


function getCell() {
	'use strict';
	return new THREE.BoxGeometry(CELL_SIZE, CELL_HEIGHT/2, CELL_SIZE);
}

function getShipPart() {
	'use strict';
	let geometry = new THREE.IcosahedronGeometry(SHIP_PART_SIZE/2, 1);
	geometry.computeBoundingBox();
	return geometry;
}
