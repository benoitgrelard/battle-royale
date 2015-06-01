import THREE from 'three';
import TWEEN from 'tween.js';
import { SHIP_PART_SIZE } from '../services/geometries';


export default {
	update,
	hoverBoard,
	revealBoard,
	discoverShipPart,
	shakeBoard
};

export const ANIMATION_SPEED_FACTOR = 1;


function update () {
	'use strict';
	TWEEN.update();
}

function hoverBoard (board, time) {
	'use strict';

	board.rotation.y += 0.00025;

	board.children.forEach((cellPivot, index) => {
		let cell = cellPivot.getObjectByName('cell');
		let { x, y } = cell.userData;
		cellPivot.position.y = Math.sin(time/1000 + (x+y)/5) * 0.25;
		// cellPivot.rotation.x = Math.sin(time/1000 + (x+y)/5) * -0.05;
		// cellPivot.rotation.z = Math.sin(time/1000 + (x+y)/5) * -0.05;
	});
}

function revealBoard (board, playerModel) {
	'use strict';

	let promise = new Promise((resolve, reject) => {
		let cells = board.children.map(cellPivot => cellPivot.getObjectByName('cell'));
		let isHuman = playerModel.type === 'human';
		let angle = isHuman ? Math.PI : -Math.PI;

		cells.forEach((cell, index) => animateCell(cells, cell, index, isHuman, angle, resolve));
	});

	return promise;



	function animateCell (cells, cell, index, isHuman, angle, resolve) {
		let { x, y } = cell.userData;
		let size = Math.sqrt(cells.length);
		let circularDistance = Math.sqrt( Math.pow( isHuman ? x : size-x, 2) + Math.pow( isHuman ? y : size-y, 2) );

		let tween = new TWEEN.Tween(cell.rotation)
			.to({ x: String(angle) }, 2000 / ANIMATION_SPEED_FACTOR)
			.delay(circularDistance * 20 / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Elastic.Out)
			.start();

		if (index === (isHuman ? cells.length-1 : 0)) {
			tween.onComplete(() => resolve());
		}
	}
}

function discoverShipPart (shipPartGroup) {
	'use strict';

	shipPartGroup.position.y -= SHIP_PART_SIZE;

	let relativeUp = 1+SHIP_PART_SIZE;
	let relativeDown = 1;

	let tweenUp = new TWEEN.Tween(shipPartGroup.position)
		.to({y: String(relativeUp)}, 200 / ANIMATION_SPEED_FACTOR)
		.easing(TWEEN.Easing.Sinusoidal.Out)
		.delay(50 / ANIMATION_SPEED_FACTOR);

	let tweenDown = new TWEEN.Tween(shipPartGroup.position)
		.to({y: String(-relativeDown)}, 400 / ANIMATION_SPEED_FACTOR)
		.easing(TWEEN.Easing.Bounce.Out);

	tweenUp.chain(tweenDown).start();

	let promise = new Promise((resolve, reject) => {
		tweenDown.onComplete(() => resolve());
	});

	return promise;
}

function shakeBoard (board, impactCoordinate, force) {
	'use strict';

	let promise = new Promise((resolve, reject) => {
		let cells = board.children.map(cellPivot => cellPivot.getObjectByName('cell'));
		cells.forEach((cell, index) => animateCell(cell, index, impactCoordinate, force, cells, resolve));
	});

	return promise;



	function animateCell (cell, index, impactCoordinate, force, cells, resolve) {
		let { x: xP, y: yP } = impactCoordinate;
		let { x, y } = cell.userData;
		let circularDistanceFromImpact = Math.sqrt( Math.pow(xP - x, 2) + Math.pow(yP - y, 2) );

		let { x: rotX, z: rotZ } = cell.rotation;
		let props = { posY: 0, rotX, rotZ };

		let tween = new TWEEN.Tween(props)
			.to({
				posY: [ cell.position.y, (10-circularDistanceFromImpact) * -0.1 * force, cell.position.y ],
				rotX: [ rotX, rotX + THREE.Math.degToRad((yP - y) * 2 * force), rotX ],
				rotZ: [ rotZ, rotZ + THREE.Math.degToRad((xP - x) * 2 * force), rotZ ]
			}, 2000 / ANIMATION_SPEED_FACTOR)
			.delay(circularDistanceFromImpact * 20 / ANIMATION_SPEED_FACTOR)
			.easing(TWEEN.Easing.Elastic.Out)
			.onUpdate(() => {
				cell.position.y = props.posY;
				cell.rotation.x = props.rotX;
				cell.rotation.z = props.rotZ;
			})
			.start();

		if (index === cells.length-1) {
			tween.onComplete(() => resolve());
		}
	}
}
