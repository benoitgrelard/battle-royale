import THREE from 'three';


export default {
	tile: {
		default: getDefaultTile(),
		missed: getMissedTile()
	},
	shipPart: {
		default: getDefaultShipPart(),
		hit: getHitShipPart(),
		sunk: getSunkShipPart()
	},
	missile: getMissile(),
	missileLine: getMissileLine()
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

function getDefaultShipPart() {
	'use strict';

	return new THREE.MeshPhongMaterial({
		color: 'white',
		emissive: 'rgb(5, 1, 4)',
		specular: 'rgb(190,190,190)',
		shininess: 40,
		shading: THREE.FlatShading
	});
}

function getHitShipPart() {
	'use strict';

	return new THREE.MeshPhongMaterial({
		color: 'red',
		emissive: 'rgb(40, 8, 30)',
		specular: 'rgb(190,190,190)',
		shininess: 40,
		shading: THREE.FlatShading,
	});
}

function getSunkShipPart() {
	'use strict';

	return new THREE.MeshPhongMaterial({
		color: 0x111111,
		emissive: 'rgb(5, 1, 4)',
		specular: 'rgb(190,190,190)',
		shininess: 40,
		shading: THREE.FlatShading
	});
}

function getMissile() {
	'use strict';

	return new THREE.MeshLambertMaterial({
		color: 0x00ff88,
		emissive: 0x008822,
		shading: THREE.FlatShading,
		transparent: true
	});
}

function getMissileLine() {
	'use strict';

	return new THREE.LineBasicMaterial({
		color: 'green',
		transparent: true,
		opacity: 0.5
	});
}
