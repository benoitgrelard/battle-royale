import THREE from 'three';


export default {
	get
};


function get() {
	'use strict';

	let ambientLight = new THREE.AmbientLight(0x202020);

	let spotLight = new THREE.SpotLight(0xffffff, 0.65);
	spotLight.position.set(5, 30, 5);
	spotLight.castShadow = true;
	spotLight.shadowDarkness = 0.85;
	spotLight.shadowCameraNear = 10;
	spotLight.shadowCameraFar = 40;
	spotLight.shadowCameraFov = 45;
	spotLight.shadowMapWidth = 2048;
	spotLight.shadowMapHeight = 2048;
	spotLight.shadowBias = 0.001;
	// spotLight.shadowCameraVisible = true;

	let spotLight2 = new THREE.SpotLight(0xff0000, 0.3);
	spotLight2.position.set(-10, 2, 10);

	let spotLight3 = new THREE.SpotLight(0x0000ff, 0.3);
	spotLight3.position.set(10, 2, -10);

	return [
		ambientLight,
		spotLight,
		spotLight2,
		spotLight3
	];
}
