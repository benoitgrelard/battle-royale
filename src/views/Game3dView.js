import View from '../lib/View';
import THREE from 'three';
import TWEEN from 'tween.js';
import createOrbitControls from 'three-orbit-controls';
import Coordinate from '../models/Coordinate';
import {
	VIEW_EVENT__SHOOT_REQUESTED,
	MODEL_EVENT__SHOT,
	VIEW_EVENT__SHOT_COMPLETED,
	VIEW_EVENT__BOARD_READY
} from '../constants';
import materials from '../services/materials';
import { CELL_HEIGHT } from '../services/geometries';
import meshes from '../services/meshes';
import lights from '../services/lights';


/**
 * @class  Game3dView
 */
export default class Game3dView extends View {

	constructor (model, element) {
		super(model, element);

		this.scene = this.getScene();
		this.camera = this.getCamera();
		this.controls = this.getControls(this.camera);
		this.renderer = this.getRenderer(this.camera);

		this.addEventListeners();

		// kick-off rendering
		this.rootElement.appendChild(this.renderer.domElement);
		this.render();
	}

	getScene () {
		let scene = new THREE.Scene();

		this.lights = lights.get();
		scene.add(...this.lights);

		this.board = meshes.makeBoard(this.model);
		scene.add(this.board);

		// scene.add(new THREE.AxisHelper());

		return scene;
	}

	getCamera () {
		let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.x = -6;
		camera.position.y = 18;
		camera.position.z = 17;

		return camera;
	}

	getControls (camera) {
		let OrbitControls = createOrbitControls(THREE);
		return new OrbitControls(camera);
	}

	getRenderer (camera) {
		let renderer = new THREE.WebGLRenderer({
			antialias: true
		});

		renderer.setClearColor(0x111111);
		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFShadowMap;

		renderer.setSize(window.innerWidth, window.innerHeight);

		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		return renderer;
	}

	render (time) {
		this.controls.update();
		TWEEN.update();

		// this.board.rotation.y += 0.0005;

		// this.animateCells(time);

		this.renderer.render(this.scene, this.camera);

		window.requestAnimationFrame(this.render.bind(this));
	}

	/*animateCells (time) {
		this.board.children.forEach((cellWrapper, index) => {
			cellWrapper.position.y = Math.sin((time)/1000 + index/30) * 0.2;
		});
	}*/

	addEventListeners () {
		// view events
		this.rootElement.addEventListener('mousemove', this.handleMouseMovedOverView.bind(this));
		this.rootElement.addEventListener('mousedown', this.handleViewClicked.bind(this));

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.humanPlayer.on('changed:activated', this.onPlayerActivationChanged.bind(this));
		this.model.computerPlayer.on('changed:activated', this.onPlayerActivationChanged.bind(this));
	}

	handleMouseMovedOverView (event) {
		this.rootElement.style.cursor = 'default';
		if (!this.model.humanPlayer.activated) { return; }

		let cells = this.getIntersectedComputerCellsFromEvent(event);

		this.rootElement.style.cursor = cells.length ? 'pointer' : 'default';
	}

	handleViewClicked (event) {
		if (!this.model.humanPlayer.activated) { return; }

		let cells = this.getIntersectedComputerCellsFromEvent(event);

		if (cells.length === 0) { return; }

		let { x, y } = cells[0].userData;

		this.emit(VIEW_EVENT__SHOOT_REQUESTED, {
			coordinate: new Coordinate({ x, y })
		});
	}

	getIntersectedComputerCellsFromEvent (event) {
		let mouseVector = new THREE.Vector2();
		let raycaster = new THREE.Raycaster();

		mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
		mouseVector.y = 1 - 2 * ( event.clientY / window.innerHeight );

		raycaster.setFromCamera(mouseVector, this.camera);

		let cellWrappers = this.board.children;
		let intersects = raycaster.intersectObjects(cellWrappers, true);
		let cells = intersects
			.filter(intersection => intersection.object.name === 'cell--computer')
			.map(cellIntersection => cellIntersection.object);

		return cells;
	}

	onPlayerShot (eventName, data, player) {
		let { coordinate, hit, sunk, ship } = data;
		let cellWrapper = this.getCellWrapperAtCoordinate(coordinate);
		let missed = !hit;
		let force = missed ? 0.35 : sunk ? 3 : hit ? 1 : 0;

		let isHuman = player.type === 'human';
		let side = isHuman ? 1 : -1;
		let missile = cellWrapper.getObjectByName(`cell--${player.type}`).clone();
		cellWrapper.add(missile);
		missile.position.y = side*5;
		missile.material = materials.cell.default.clone();
		missile.material.color = new THREE.Color(0x333333);
		missile.material.emissive = new THREE.Color(0x330000);
		missile.material.transparent = true;
		missile.material.opacity = 0;
		new TWEEN.Tween(missile.position)
			.to({y: side*CELL_HEIGHT*0.75}, 500)
			.easing(TWEEN.Easing.Exponential.In)
			.start()
			.onUpdate(() => missile.material.opacity += 0.1)
			.onComplete(() => {

			cellWrapper.remove(missile);

			if (missed) {
				let cell = cellWrapper.getObjectByName(`cell--${player.type}`);
				cell.material = materials.cell.missed;
			}
			else if (sunk) {
				let shipPartCoordinates = player.board.getAllShipPartCoordinates(ship);
				shipPartCoordinates.forEach((coordinate, index) => {
					let cellWrapper = this.getCellWrapperAtCoordinate(coordinate);
					let shipPart = cellWrapper.getObjectByName(`shipPart--${player.type}`);
					// shipPart.getObjectByName('red-light').intensity = 3;
					// shipPart.getObjectByName('red-light').color = new THREE.Color('blue');
					shipPart.material = materials.shipPart.sunk;
					shipPart.visible = true;
				});
			}
			else if (hit) {
				let shipPart = cellWrapper.getObjectByName(`shipPart--${player.type}`);
				// shipPart.getObjectByName('red-light').intensity = 3;
				shipPart.material = materials.shipPart.hit;
				if (player === this.model.computerPlayer) {
					shipPart.visible = true;
				}
				this.popShipPart(player, shipPart, 0, 1.5*force);
			}

			let { x: xP, y: yP } = coordinate;
			let cellWrappers = this.board.children;
			cellWrappers.forEach((cellWrapper, index) => {

				let { x, y } = cellWrapper.userData;
				let circularDistanceFromImpact = Math.sqrt( Math.pow(xP - x, 2) + Math.pow(yP - y, 2) );

				let { x: rotX, z: rotZ } = cellWrapper.rotation;
				let props = { posY: 0, rotX, rotZ };

				let tween = new TWEEN.Tween(props);

				tween
					.to({
						posY: [ cellWrapper.position.y, (10-circularDistanceFromImpact) * -0.1 * force, cellWrapper.position.y ],
						rotX: [ rotX, rotX + THREE.Math.degToRad((yP - y) * 3 * force), rotX ],
						rotZ: [ rotZ, rotZ + THREE.Math.degToRad((xP - x) * -3 * force), rotZ ]
					}, 2000)
					.delay(circularDistanceFromImpact * 20)
					.easing(TWEEN.Easing.Elastic.Out)
					.onUpdate(() => {
						cellWrapper.position.y = props.posY;
						cellWrapper.rotation.x = props.rotX;
						cellWrapper.rotation.z = props.rotZ;
					})
					.start();

				if (index === cellWrappers.length-1) {
					tween.onComplete(() => {
						this.emit(VIEW_EVENT__SHOT_COMPLETED, {
							player
						});
					});
				}

			});

		});
	}

	popShipPart (player, shipPart, down, up, delay=0) {
		let isHuman = player.type === 'human';
		let side = isHuman ? 1 : -1;
		let pos = shipPart.position.y;

		shipPart.position.y = down;

		new TWEEN.Tween(shipPart.position)
			.to({y: [down, side*up]}, 200)
			.easing(TWEEN.Easing.Sinusoidal.Out)
			.delay(delay)
			.start()
			.chain(
				new TWEEN.Tween(shipPart.position)
					.to({y: pos}, 400)
					.easing(TWEEN.Easing.Bounce.Out)
			);
	}

	onPlayerActivationChanged (eventName, data, player) {
		let isActive = data.newValue === true;
		if (!isActive) { return; }

		this.onPlayerActivated(player);
	}

	onPlayerActivated (player) {
		this.revealBoard(player);
	}

	revealBoard (player) {
		let cellWrappers = this.board.children;
		let isHuman = player === this.model.humanPlayer;
		let angle = isHuman ? Math.PI : -Math.PI;

		cellWrappers.forEach((cellWrapper, index) => {

			let tween = new TWEEN.Tween(cellWrapper.rotation);
			let { x, y } = cellWrapper.userData;
			let s = this.model.boardSize;
			let circularDistance = Math.sqrt( Math.pow( isHuman ? x : s-x, 2) + Math.pow( isHuman ? y : s-y, 2) );
			// let circularDistance = isHuman ? y : s-y;

			tween
				.to({ x: String(angle) }, 750)
				.delay(75 * circularDistance)
				.easing(TWEEN.Easing.Exponential.Out)
				.start();

			if (index === (isHuman ? cellWrappers.length-1 : 0)) {
				tween.onComplete(() => {
					this.emit(VIEW_EVENT__BOARD_READY, {
						player
					});
				});
			}

		});
	}

	getCellWrapperAtCoordinate (coordinate) {
		return this.board.children.filter(cellWrapper => {
			return cellWrapper.userData.x === coordinate.x && cellWrapper.userData.y === coordinate.y;
		})[0];
	}

}
