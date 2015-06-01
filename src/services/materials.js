import THREE from 'three';


export default {
	tile: {
		default: getDefaultTile(),
		missed: getMissedTile()
	}
};


function getDefaultTile() {
	'use strict';

	return new THREE.MeshLambertMaterial({
		color: 'grey',
		emissive: 'rgb(5, 1, 4)',
		shading: THREE.FlatShading
	});
}

function getMissedTile() {
	'use strict';

	return new THREE.MeshLambertMaterial({
		color: 'cyan',
		emissive: 0x009999,
		shading: THREE.FlatShading,
		transparent: true,
		opacity: 0.2
	});
}
