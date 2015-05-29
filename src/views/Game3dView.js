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
import { TILE_HEIGHT, SHIP_PART_SIZE } from '../services/geometries';
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

		scene.add(new THREE.AxisHelper());

		/*this.lights.forEach(light => {
			if (light.type !== 'SpotLight') { return; }
			scene.add(new THREE.SpotLightHelper(light));
		});*/

		return scene;
	}

	getCamera () {
		let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.x = -10;
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

		// this.board.rotation.y += 0.001;// 0.00025;

		// this.animateCells(time);

		this.renderer.render(this.scene, this.camera);

		window.requestAnimationFrame(this.render.bind(this));
	}

	animateCells (time) {
		this.board.children.forEach((cell, index) => {
			cell.position.y = Math.sin((time)/1000 + index/30) * 0.2;
		});
	}

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

		let cellSides = this.getIntersectedComputerCellSideFromEvent(event);

		this.rootElement.style.cursor = cellSides.length ? 'pointer' : 'default';
	}

	handleViewClicked (event) {
		if (!this.model.humanPlayer.activated) { return; }

		let cellSides = this.getIntersectedComputerCellSideFromEvent(event);

		if (cellSides.length === 0) { return; }

		let { x, y } = cellSides[0].parent.userData;

		this.emit(VIEW_EVENT__SHOOT_REQUESTED, {
			coordinate: new Coordinate({ x, y })
		});
	}

	getIntersectedComputerCellSideFromEvent (event) {
		let mouseVector = new THREE.Vector2();
		let raycaster = new THREE.Raycaster();

		mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
		mouseVector.y = 1 - 2 * ( event.clientY / window.innerHeight );

		raycaster.setFromCamera(mouseVector, this.camera);

		let cells = this.board.children;
		let intersects = raycaster.intersectObjects(cells, true);
		let cellSides = intersects
			.filter(intersection => {
				return intersection.object.name === 'tile' &&
					   intersection.object.parent.name === 'cellSide--computer';
			})
			.map(cellIntersection => cellIntersection.object.parent);

		return cellSides;
	}

	onPlayerShot (eventName, data, player) {
		let { coordinate, hit, sunk, ship } = data;
		let missed = !hit;
		let force = missed ? 0.35 : sunk ? 3 : hit ? 1 : 0;

		let tile = this.getTileAtCoordinate(coordinate, player);
		let missile = meshes.makeMissile();

		tile.add(missile);

		missile.position.y = 5;
		missile.material.opacity = 0;

		console.log(missile.localToWorld(missile.position));

		let light = this.lights[4];
		// light.intensity = 3;
		// light.position.copy(missile.localToWorld(missile.position));
		light.position.setFromMatrixPosition(missile.matrixWorld);
		console.log(light.position);

		new TWEEN.Tween(missile.position)
			.to({y: TILE_HEIGHT*0.75}, 500)
			.easing(TWEEN.Easing.Exponential.In)
			.start()
			.onUpdate(() => {
				missile.material.opacity += 0.1;
				light.intensity += 0.1;
				light.position.copy(missile.localToWorld(missile.position));
			})
			.onComplete(() => {

			light.intensity = 0;
			tile.remove(missile);

			if (missed) {
				let tile = this.getTileAtCoordinate(coordinate, player);
				tile.material = materials.tile.missed;
			}
			else if (sunk) {
				let shipPartCoordinates = player.board.getAllShipPartCoordinates(ship);
				shipPartCoordinates.forEach((coordinate, index) => {

					let shipPart = this.getShipPartAtCoordinate(coordinate, player);
					shipPart.material = materials.shipPart.sunk;
					shipPart.visible = true;

					let light = this.getShipLightAtCoordinate(coordinate, player);
					light.intensity = 3;
					light.color = new THREE.Color('blue');

				});
			}
			else if (hit) {
				let shipPart = this.getShipPartAtCoordinate(coordinate, player);
				shipPart.material = materials.shipPart.hit;
				if (player === this.model.computerPlayer) {
					shipPart.visible = true;
				}

				let light = this.getShipLightAtCoordinate(coordinate, player);
				light.intensity = 3;

				let shipPartGroup = shipPart.parent;
				shipPartGroup.position.y -= SHIP_PART_SIZE;
				let relativeUp = 1+SHIP_PART_SIZE;
				let relativeDown = 1;
				this.animateJump(shipPartGroup, relativeUp, relativeDown, 50);
			}

			let { x: xP, y: yP } = coordinate;
			let cells = this.board.children;
			cells.forEach((cell, index) => {

				let { x, y } = cell.userData;
				let circularDistanceFromImpact = Math.sqrt( Math.pow(xP - x, 2) + Math.pow(yP - y, 2) );

				let { x: rotX, z: rotZ } = cell.rotation;
				let props = { posY: 0, rotX, rotZ };

				let tween = new TWEEN.Tween(props);

				tween
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

				/*if (index === cells.length-1) {
					tween.onComplete(() => {
						this.emit(VIEW_EVENT__SHOT_COMPLETED, {
							player
						});
					});
				}*/

			});

		});
	}

	animateJump (object, upRelative, downRelative=upRelative, delay=0) {

		new TWEEN.Tween(object.position)
			.to({y: String(upRelative)}, 200)
			.easing(TWEEN.Easing.Sinusoidal.Out)
			.delay(delay)
			.start()
			.chain(
				new TWEEN.Tween(object.position)
					.to({y: String(-downRelative)}, 400)
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
		let cells = this.board.children;
		let isHuman = player === this.model.humanPlayer;
		let angle = isHuman ? Math.PI : -Math.PI;

		cells.forEach((cell, index) => {

			let tween = new TWEEN.Tween(cell.rotation);
			let { x, y } = cell.userData;
			let s = this.model.boardSize;
			let circularDistance = Math.sqrt( Math.pow( isHuman ? x : s-x, 2) + Math.pow( isHuman ? y : s-y, 2) );
			// let circularDistance = isHuman ? y : s-y;

			tween
				.to({ x: String(angle) }, 750)
				.delay(75 * circularDistance)
				.easing(TWEEN.Easing.Exponential.Out)
				.start();

			if (index === (isHuman ? cells.length-1 : 0)) {
				tween.onComplete(() => {
					this.emit(VIEW_EVENT__BOARD_READY, {
						player
					});
				});
			}

		});
	}

	getCellAtCoordinate (coordinate) {
		return this.board.children.filter(cell => {
			return cell.userData.x === coordinate.x && cell.userData.y === coordinate.y;
		})[0];
	}

	getCellSideAtCoordinate (coordinate, player) {
		return this.getCellAtCoordinate(coordinate).getObjectByName(`cellSide--${player.type}`);
	}

	getTileAtCoordinate (coordinate, player) {
		return this.getCellSideAtCoordinate(coordinate, player).getObjectByName('tile');
	}

	getShipPartAtCoordinate (coordinate, player) {
		return this.getTileAtCoordinate(coordinate, player).getObjectByName('shipPart');
	}

	getShipLightAtCoordinate (coordinate, player) {
		return this.getTileAtCoordinate(coordinate, player).getObjectByName('light');
	}

}
