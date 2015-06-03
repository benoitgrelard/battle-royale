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

/**
 * @class ShipPart
 */
export default class ShipPart extends THREE.Group {

	constructor (playerModel) {
		super();

		this.playerModel = playerModel;
		this.name = 'shipPart';

		this.body = new THREE.Mesh(SHIP_PART_BODY_GEOMETRY, SHIP_PART_BODY_MATERIALS.default);
		this.body.name = 'body';
		this.body.castShadow = true;
		this.body.visible = playerModel.type === 'human';
		this.add(this.body);

		this.light = new THREE.PointLight('white', 0, 2);
		this.light.name = 'light';
		this.add(this.light);

		this.translateY((SHIP_PART_SIZE + TILE_HEIGHT) / 2);
	}

	takeHit () {
		if (this.playerModel.type === 'computer') {
			this.body.visible = true;
		}

		this.body.material = SHIP_PART_BODY_MATERIALS.hit;

		this.light.color = HIT_SHIP_PART_LIGHT_COLOR;
		this.light.intensity = SHIP_PART_LIGHT_INTENSITY;

		return this.animateHit();
	}

	animateHit () {
		this.position.y -= SHIP_PART_SIZE;

		let relativeUp = 1 + SHIP_PART_SIZE;
		let relativeDown = 1;

		let tweenUp = new TWEEN.Tween(this.position)
			.to({y: String(relativeUp)}, 200 / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Sinusoidal.Out)
			.delay(50 / ANIMATION_SPEED_FACTOR);

		let tweenDown = new TWEEN.Tween(this.position)
			.to({y: String(-relativeDown)}, 400 / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Bounce.Out);

		tweenUp.chain(tweenDown);
		tweenUp.start();

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
