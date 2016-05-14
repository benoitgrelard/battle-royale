import THREE from 'three';
import TWEEN from 'tween.js';
import { ANIMATION_SPEED_FACTOR } from '../../constants';


export const SHIP_PART_SIZE = 0.75;

export const SHIP_PART_LIGHT_INTENSITY = 3;

export const HIT_SHIP_PART_LIGHT_COLOR = new THREE.Color('red');

export const SHIP_PART_BODY_GEOMETRY = new THREE.IcosahedronGeometry(SHIP_PART_SIZE / 2, 1);

export const SHIP_PART_BODY_MATERIALS = {
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
		shading: THREE.FlatShading
	}),

	sunk: new THREE.MeshPhongMaterial({
		color: 0x111111,
		emissive: 'rgb(5, 1, 4)',
		specular: 'rgb(50,50,50)',
		shininess: 40,
		shading: THREE.FlatShading
	})
};

export const SHIP_PART_SHADOW_GEOMETRY = new THREE.CircleGeometry(SHIP_PART_SIZE / 2 * 0.9, 12);

export const SHIP_PART_SHADOW_MATERIAL = new THREE.MeshLambertMaterial({
	color: 'black',
	shading: THREE.FlatShading,
	transparent: true,
	opacity: 0.45
});

/**
 * @class ShipPart
 */
export default class ShipPart extends THREE.Group {

	constructor(playerModel) {
		super();

		this.name = 'shipPart';

		this.playerModel = playerModel;

		this.bodyWrapper = new THREE.Group();
		this.bodyWrapper.name = 'bodyWrapper';
		this.add(this.bodyWrapper);

		this.body = this.getBody();
		this.bodyWrapper.add(this.body);

		this.light = this.getLight();
		this.bodyWrapper.add(this.light);

		this.shadow = this.getShadow();
		this.add(this.shadow);

		this.translateY(SHIP_PART_SIZE / 2);
	}

	getBody() {
		const body = new THREE.Mesh(SHIP_PART_BODY_GEOMETRY, SHIP_PART_BODY_MATERIALS.default);
		body.name = 'body';
		body.visible = this.playerModel.type === 'human';

		return body;
	}

	getLight() {
		const light = new THREE.PointLight('white', 0, 2);
		light.name = 'light';

		return light;
	}

	getShadow() {
		const shadow = new THREE.Mesh(SHIP_PART_SHADOW_GEOMETRY, SHIP_PART_SHADOW_MATERIAL);
		shadow.name = 'shadow';
		shadow.rotation.x = -Math.PI / 2;
		shadow.position.set(-0.05, -SHIP_PART_SIZE / 2 + 0.001, -0.05);
		shadow.visible = this.playerModel.type === 'human';

		return shadow;
	}

	takeHit() {
		this.body.material = SHIP_PART_BODY_MATERIALS.hit;
		this.light.color = HIT_SHIP_PART_LIGHT_COLOR;
		this.bodyWrapper.position.y -= SHIP_PART_SIZE;

		const relativeUp = 1 + SHIP_PART_SIZE;
		const relativeDown = 1;
		const upDelay = 100;
		const upDuration = 200;
		const downDuration = 400;

		const tweenUp = new TWEEN.Tween(this.bodyWrapper.position)
			.to({ y: String(relativeUp) }, upDuration / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Sinusoidal.Out)
			.delay(upDelay / ANIMATION_SPEED_FACTOR)
			.onStart(() => {
				if (this.playerModel.type === 'computer') {
					this.body.visible = true;
					this.shadow.visible = true;
				}
				this.light.intensity = SHIP_PART_LIGHT_INTENSITY;
			});

		const tweenDown = new TWEEN.Tween(this.bodyWrapper.position)
			.to({ y: String(-relativeDown) }, downDuration / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Bounce.Out);

		const tweenShadow = new TWEEN.Tween(this.shadow.scale)
			.to({ x: [0.65, 1], y: [0.65, 1] }, downDuration / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Bounce.Out)
			.delay((upDelay + upDuration) / ANIMATION_SPEED_FACTOR);

		tweenUp.chain(tweenDown);
		tweenUp.start();
		tweenShadow.start();

		const promise = new Promise(resolve => {
			tweenDown.onComplete(() => resolve());
		});

		return promise;
	}

	sink() {
		this.body.material = SHIP_PART_BODY_MATERIALS.sunk;
		this.body.visible = true;
		this.light.intensity = 0;
		this.shadow.visible = true;
	}

}
