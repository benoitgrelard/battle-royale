import THREE from 'three';
import TWEEN from 'tween.js';
import { TILE_HEIGHT } from './Tile';
import { ANIMATION_SPEED_FACTOR } from '../../constants';



export const SHIP_PART_SIZE = 0.75;
export const SHIP_PART_LIGHT_INTENSITY = 3;
export const HIT_SHIP_PART_LIGHT_COLOR = new THREE.Color('red');
export const SUNK_SHIP_PART_LIGHT_COLOR = new THREE.Color('blue');
export const SHIP_PART_BODY_GEOMETRY = getBodyGeometry();
export const SHIP_PART_BODY_MATERIALS = getBodyMaterials();
export const SHIP_PART_SHADOW_GEOMETRY = getShipPartShadowGeometry();
export const SHIP_PART_SHADOW_MATERIAL = getShipPartShadowMaterial();

/**
 * @class ShipPart
 */
export default class ShipPart extends THREE.Group {

	constructor (playerModel) {
		super();

		this.playerModel = playerModel;
		this.name = 'shipPart';

		this.bodyWrapper = new THREE.Group();
		this.bodyWrapper.name = 'bodyWrapper';
		this.add(this.bodyWrapper);

		this.body = new THREE.Mesh(SHIP_PART_BODY_GEOMETRY, SHIP_PART_BODY_MATERIALS.default);
		this.body.name = 'body';
		this.body.visible = playerModel.type === 'human';
		this.bodyWrapper.add(this.body);

		this.light = new THREE.PointLight('white', 0, 2);
		this.light.name = 'light';
		this.bodyWrapper.add(this.light);

		this.shadow = new THREE.Mesh(SHIP_PART_SHADOW_GEOMETRY, SHIP_PART_SHADOW_MATERIAL);
		this.shadow.name = 'shadow';
		this.shadow.rotation.x = -Math.PI/2;
		this.shadow.position.set(-0.05, -SHIP_PART_SIZE/2 + 0.001, -0.05);
		this.shadow.visible = playerModel.type === 'human';
		this.add(this.shadow);

		this.translateY((SHIP_PART_SIZE + TILE_HEIGHT) / 2);
	}

	takeHit () {
		this.body.material = SHIP_PART_BODY_MATERIALS.hit;
		this.light.color = HIT_SHIP_PART_LIGHT_COLOR;
		this.bodyWrapper.position.y -= SHIP_PART_SIZE;

		let relativeUp = 1 + SHIP_PART_SIZE;
		let relativeDown = 1;
		let upDelay = 100;
		let upDuration = 200;
		let downDuration = 400;

		let tweenUp = new TWEEN.Tween(this.bodyWrapper.position)
			.to({y: String(relativeUp)}, upDuration / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Sinusoidal.Out)
			.delay(upDelay / ANIMATION_SPEED_FACTOR)
			.onStart(() => {
				if (this.playerModel.type === 'computer') {
					this.body.visible = true;
					this.shadow.visible = true;
				}
				this.light.intensity = SHIP_PART_LIGHT_INTENSITY;
			});

		let tweenDown = new TWEEN.Tween(this.bodyWrapper.position)
			.to({y: String(-relativeDown)}, downDuration / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Bounce.Out);

		let tweenShadow = new TWEEN.Tween(this.shadow.scale)
			.to({ x: [0.65, 1], y: [0.65, 1] }, downDuration / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Bounce.Out)
			.delay((upDelay + upDuration) / ANIMATION_SPEED_FACTOR);

		tweenUp.chain(tweenDown);
		tweenUp.start();
		tweenShadow.start();

		let promise = new Promise((resolve, reject) => {
			tweenDown.onComplete(() => resolve());
		});

		return promise;
	}

	sink () {
		this.body.material = SHIP_PART_BODY_MATERIALS.sunk;
		this.body.visible = true;

		this.light.color = SUNK_SHIP_PART_LIGHT_COLOR;
		this.light.intensity = SHIP_PART_LIGHT_INTENSITY;

		this.shadow.visible = true;
	}

}



function getBodyGeometry () {
	'use strict';
	return new THREE.IcosahedronGeometry(SHIP_PART_SIZE/2, 1);
}

function getBodyMaterials () {
	'use strict';

	return {
		default: new THREE.MeshPhongMaterial({
			color: 'white',
			emissive: 'rgb(5, 1, 4)',
			specular: 'rgb(190,190,190)',
			shininess: 40,
			shading: THREE.FlatShading
		}),

		hit: new THREE.MeshPhongMaterial({
			color: 'red',
			emissive: 'rgb(40, 8, 30)',
			specular: 'rgb(190,190,190)',
			shininess: 40,
			shading: THREE.FlatShading,
		}),

		sunk: new THREE.MeshPhongMaterial({
			color: 0x111111,
			emissive: 'rgb(5, 1, 4)',
			specular: 'rgb(190,190,190)',
			shininess: 40,
			shading: THREE.FlatShading
		})
	};
}

function getShipPartShadowGeometry() {
	'use strict';
	return new THREE.CircleGeometry(SHIP_PART_SIZE/2, 8);
}

function getShipPartShadowMaterial() {
	'use strict';
	return new THREE.MeshLambertMaterial({
		color: 'black',
		shading: THREE.FlatShading,
		transparent: true,
		opacity: 0.65
	});
}
