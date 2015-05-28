import THREE from 'three';


export default {
	cell: {
		default: getDefaultCell(),
		missed: getMissedCell()
	},
	shipPart: {
		default: getDefaultShipPart(),
		hit: getHitShipPart(),
		sunk: getSunkShipPart()
	}
};


function getDefaultCell() {
	'use strict';

	return new THREE.MeshLambertMaterial({
		color: 'grey',
		emissive: 'rgb(5, 1, 4)',
		shading: THREE.FlatShading
	});
}

function getMissedCell() {
	'use strict';

	return new THREE.MeshLambertMaterial({
		color: 'blue',
		shading: THREE.FlatShading
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
