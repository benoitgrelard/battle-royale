import THREE from 'three';
import TWEEN from 'tween.js';
import { TILE_HEIGHT, SHIP_PART_SIZE, MISSILE_HEIGHT } from '../services/geometries';
import { MISSILE_DROP_HEIGHT } from '../services/meshes';


export default {
	update,
	hoverBoard,
	revealBoard,
	dropMissile,
	discoverShipPart,
	shakeBoard
};


function update () {
	'use strict';
	TWEEN.update();
}

function hoverBoard (board, time) {
	'use strict';

	board.rotation.y += 0.00025;
	let size = Math.sqrt(board.children.length);

	board.children.forEach((cellPivot, index) => {
		let cell = cellPivot.getObjectByName('cell');
		let { x, y } = cell.userData;
		let circularDistance = Math.sqrt( Math.pow(size-x, 2) + Math.pow(size-y, 2) );
		cellPivot.position.y = Math.sin(time/1000 + circularDistance) * 0.1;
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

function dropMissile (missileObject, tile) {
	'use strict';

	let missile = missileObject.getObjectByName('missile');
	let line = missileObject.getObjectByName('line');
	let light = missileObject.getObjectByName('light');

	missileObject.position.copy(tile.parent.localToWorld(tile.position.clone()));
	missileObject.position.y = MISSILE_DROP_HEIGHT-2;

	missile.material.opacity = 0;
	missile.visible = true;

	line.visible = true;
	line.material.linewidth = 0.1;
	let props = { width: line.material.linewidth };
	new TWEEN.Tween(props)
		.to({ width: [3, 0.1] }, 700)
		.onUpdate(() => line.material.linewidth = props.width)
		.start();

	light.intensity = 0;

	let tweenUp = new TWEEN.Tween(missileObject.position)
		.to({ y: '+2' }, 350)
		.easing(TWEEN.Easing.Exponential.Out)
		.onUpdate(() => {
			missile.rotation.y += 0.5;
			missile.material.opacity += 0.1;
			light.intensity += 0.3;
		});

	let tweenDown = new TWEEN.Tween(missileObject.position)
		.to({y: (TILE_HEIGHT + MISSILE_HEIGHT)/2}, 400)
		.easing(TWEEN.Easing.Exponential.In)
		.onUpdate(() => {
			missile.rotation.y += 0.1;
			light.intensity += 0.3;
		});

	tweenUp.chain(tweenDown);
	tweenUp.start();

	let promise = new Promise((resolve, reject) => {
		tweenDown.onComplete(() => {
			light.intensity = 0;
			missile.visible = false;
			line.visible = false;
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
