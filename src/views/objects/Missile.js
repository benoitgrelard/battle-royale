import THREE from 'three';
import TWEEN from 'tween.js';
import { ANIMATION_SPEED_FACTOR } from '../../constants';
import { TILE_HEIGHT } from './Tile';


export const MISSILE_SIZE = 0.3;
export const MISSILE_HEIGHT = 0.75;
export const MISSILE_PRE_DROP_HEIGHT = 3;
export const MISSILE_DROP_HEIGHT = 5;
export const MISSILE_BODY_GEOMETRY = getBodyGeometry();
export const MISSILE_BODY_MATERIAL = getBodyMaterial();
export const MISSILE_TRAIL_GEOMETRY = getTrailGeometry();
export const MISSILE_TRAIL_MATERIAL = getTrailMaterial();

export default class Missile extends THREE.Group {

	constructor () {
		super();

		this.name = 'missile';

		this.body = new THREE.Mesh(MISSILE_BODY_GEOMETRY, MISSILE_BODY_MATERIAL);
		this.body.name = 'body';
		this.add(this.body);

		this.trail = new THREE.Line(MISSILE_TRAIL_GEOMETRY, MISSILE_TRAIL_MATERIAL);
		this.trail.name = 'trail';
		this.trail.translateY(-MISSILE_DROP_HEIGHT);
		this.add(this.trail);

		this.light = new THREE.PointLight(0x00ff88, 3, 5);
		this.light.name = 'light';
		this.add(this.light);

		this.hide();
	}

	hide () {
		this.body.visible = false;
		this.trail.visible = false;
		this.light.intensity = 0;
	}

	positionOverTile (tile) {
		this.position.copy(tile.parent.localToWorld(tile.position.clone()));
		this.position.y = MISSILE_PRE_DROP_HEIGHT;
	}

	drop () {
		this.body.material.opacity = 0;
		this.body.visible = true;

		this.trail.visible = true;
		this.trail.material.linewidth = 0.1;

		this.light.intensity = 0;

		new TWEEN.Tween(this.trail.material)
			.to({ linewidth: [5, 0.1] }, 700 / ANIMATION_SPEED_FACTOR)
			.start();

		let tweenUp = new TWEEN.Tween(this.position)
			.to({ y: '+2' }, 350 / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Exponential.Out)
			.onUpdate(() => {
				this.body.rotation.y += 0.5;
				this.body.material.opacity += 0.1;
				this.light.intensity += 0.3;
			});

		let tweenDown = new TWEEN.Tween(this.position)
			.to({y: (TILE_HEIGHT + MISSILE_HEIGHT)/2}, 400 / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Exponential.In)
			.onUpdate(() => {
				this.body.rotation.y += 0.1;
				this.light.intensity += 0.3;
			});

		tweenUp.chain(tweenDown);
		tweenUp.start();

		let promise = new Promise((resolve, reject) => {
			tweenDown.onComplete(() => {
				this.hide();
				resolve();
			});
		});

		return promise;
	}

}


function getBodyGeometry () {
	'use strict';
	return new THREE.CylinderGeometry(MISSILE_SIZE, 0, MISSILE_HEIGHT, 3, 1);
}

function getBodyMaterial () {
	'use strict';

	return new THREE.MeshLambertMaterial({
		color: 0x00ff88,
		emissive: 0x008822,
		shading: THREE.FlatShading,
		transparent: true
	});
}

function getTrailGeometry() {
	'use strict';

	let lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(
		new THREE.Vector3(0, 100, 0),
		new THREE.Vector3(0, -100, 0)
	);

	return lineGeometry;
}

function getTrailMaterial () {
	'use strict';

	return new THREE.LineBasicMaterial({
		color: 'green',
		transparent: true,
		opacity: 0.5
	});
}
