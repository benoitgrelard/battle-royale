import THREE from 'three';


export default {
	get
};


function get() {
	'use strict';

	let ambientLight = new THREE.AmbientLight(0x222222);

	let topLight = new THREE.SpotLight(0xffffff, 0.65, 50, Math.PI/6, 1);
	topLight.position.set(5, 30, 5);
	topLight.castShadow = true;
	topLight.shadowDarkness = 0.85;
	topLight.shadowCameraNear = 10;
	topLight.shadowCameraFar = 40;
	topLight.shadowCameraFov = 45;
	topLight.shadowMapWidth = 2048;
	topLight.shadowMapHeight = 2048;
	topLight.shadowBias = 0.001;
	// topLight.shadowCameraVisible = true;

	let redLight = new THREE.SpotLight(0xff0000, 0.65, 50, Math.PI/8);
	redLight.position.set(-30, 5, 15);

	let blueLight = new THREE.SpotLight(0x0000ff, 0.65, 50, Math.PI/8);
	blueLight.position.set(-30, 5, -15);

	let missileLight = new THREE.PointLight(0x00ff00, 0, 10);
	missileLight.name = 'missileLight';

	return [
		ambientLight,
		topLight,
		redLight,
		blueLight,
		missileLight
	];
}
