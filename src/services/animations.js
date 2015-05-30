import THREE from 'three';
import TWEEN from 'tween.js';
import { TILE_HEIGHT, SHIP_PART_SIZE, MISSILE_HEIGHT } from '../services/geometries';


export default {
	update,
	revealBoard,
	dropMissile,
	discoverShipPart,
	shakeBoard
};


function update () {
	'use strict';
	TWEEN.update();
}

function revealBoard (board, playerModel) {
	'use strict';

	let promise = new Promise((resolve, reject) => {
		let cells = board.children;
		let isHuman = playerModel.type === 'human';
		let angle = isHuman ? Math.PI : -Math.PI;

		cells.forEach((cell, index) => animateCell(cells, cell, index, isHuman, angle, resolve));
	});

	return promise;



	function animateCell (cells, cell, index, isHuman, angle, resolve) {
		let tween = new TWEEN.Tween(cell.rotation);
		let { x, y } = cell.userData;
		let size = Math.sqrt(cells.length);
		let circularDistance = Math.sqrt( Math.pow( isHuman ? x : size-x, 2) + Math.pow( isHuman ? y : size-y, 2) );

		tween
			.to({ x: String(angle) }, 750)
			.delay(75 * circularDistance)
			.easing(TWEEN.Easing.Exponential.Out)
			.start();

		if (index === (isHuman ? cells.length-1 : 0)) {
			tween.onComplete(() => resolve());
		}
	}
}

function dropMissile (missile, tile) {
	'use strict';

	missile.position.copy(tile.parent.localToWorld(tile.position.clone()));
	missile.position.y = 5;
	missile.getObjectByName('missile').material.opacity = 0;
	missile.getObjectByName('missile').visible = true;
	missile.getObjectByName('line').visible = true;

	missile.getObjectByName('light').intensity = 0.5;

	let tween = new TWEEN.Tween(missile.position)
		.to({y: (TILE_HEIGHT + MISSILE_HEIGHT)/2}, 500)
		.easing(TWEEN.Easing.Exponential.In)
		.start()
		.onUpdate(() => {
			missile.getObjectByName('missile').material.opacity += 0.1;
			missile.getObjectByName('light').intensity += 0.3;
		});

	let promise = new Promise((resolve, reject) => {
		tween.onComplete(() => {
			missile.getObjectByName('light').intensity = 0;
			missile.getObjectByName('missile').visible = false;
			missile.getObjectByName('line').visible = false;
			resolve();
		});
	});

	return promise;
}

function discoverShipPart (shipPartGroup) {
	'use strict';

	shipPartGroup.position.y -= SHIP_PART_SIZE;

	let relativeUp = 1+SHIP_PART_SIZE;
	let relativeDown = 1;

	let tweenUp = new TWEEN.Tween(shipPartGroup.position)
		.to({y: String(relativeUp)}, 200)
		.easing(TWEEN.Easing.Sinusoidal.Out)
		.delay(50);

	let tweenDown = new TWEEN.Tween(shipPartGroup.position)
		.to({y: String(-relativeDown)}, 400)
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
		let cells = board.children;
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
				rotX: [ rotX, rotX + THREE.Math.degToRad((yP - y) * 3 * force), rotX ],
				rotZ: [ rotZ, rotZ + THREE.Math.degToRad((xP - x) * -3 * force), rotZ ]
			}, 2000)
			.delay(circularDistanceFromImpact * 20)
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
