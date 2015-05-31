import View from '../lib/View';
import THREE from 'three';
import createOrbitControls from 'three-orbit-controls';
import Coordinate from '../models/Coordinate';
import {
	VIEW_EVENT__SHOOT_REQUESTED,
	MODEL_EVENT__SHOT,
	VIEW_EVENT__SHOT_COMPLETED,
	VIEW_EVENT__BOARD_READY
} from '../constants';
import materials from '../services/materials';
import meshes from '../services/meshes';
import lights, { HIT_SHIP_PART_LIGHT_COLOR, SUNK_SHIP_PART_LIGHT_COLOR, SHIP_PART_LIGHT_INTENSITY } from '../services/lights';
import animations from '../services/animations';


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

		this.scenelights = lights.makeScene();
		scene.add(...this.scenelights);

		this.board = meshes.makeBoard(this.model);
		scene.add(this.board);

		this.missile = meshes.makeMissile();
		this.missile.getObjectByName('missile').visible = false;
		this.missile.getObjectByName('line').visible = false;
		scene.add(this.missile);

		this.fog = new THREE.FogExp2(0x111111, 0.025);
		scene.fog = this.fog;

		// scene.add(new THREE.AxisHelper());

		/*this.scenelights.forEach(light => {
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

		// renderer.setPixelRatio(window.devicePixelRatio);
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
		animations.update();

		animations.hoverBoard(this.board, time);

		this.renderer.render(this.scene, this.camera);

		window.requestAnimationFrame(this.render.bind(this));
	}

	addEventListeners () {
		// view events
		this.rootElement.addEventListener('mousemove', this.handleMouseMovedOverView.bind(this));
		this.rootElement.addEventListener('mousedown', this.handleViewClicked.bind(this));

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.humanPlayer.on('changed:isActive', this.onPlayerActivationChanged.bind(this));
		this.model.computerPlayer.on('changed:isActive', this.onPlayerActivationChanged.bind(this));
	}

	handleMouseMovedOverView (event) {
		this.rootElement.style.cursor = 'default';
		if (!this.model.humanPlayer.canPlay) { return; }

		let cellSides = this.getIntersectedComputerCellSideFromEvent(event);

		this.rootElement.style.cursor = cellSides.length ? 'pointer' : 'default';
	}

	handleViewClicked (event) {
		if (!this.model.humanPlayer.canPlay) { return; }

		let cellSides = this.getIntersectedComputerCellSideFromEvent(event);

		if (cellSides.length === 0) { return; }

		let { x, y } = cellSides[0].parent.userData;

		this.emit(VIEW_EVENT__SHOOT_REQUESTED, {
			coordinate: new Coordinate({ x, y })
		});

		this.model.humanPlayer.canPlay = false;
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
		let force = missed ? 1 : sunk ? 6 : hit ? 3 : 0;

		let tile = this.getTileAtCoordinate(coordinate, player);
		let completed = animations.dropMissile(this.missile, tile);

		completed.then(() => {
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
					light.color = SUNK_SHIP_PART_LIGHT_COLOR;
					light.intensity = SHIP_PART_LIGHT_INTENSITY;

				});
			}
			else if (hit) {
				let shipPart = this.getShipPartAtCoordinate(coordinate, player);
				shipPart.material = materials.shipPart.hit;
				if (player === this.model.computerPlayer) {
					shipPart.visible = true;
				}

				let light = this.getShipLightAtCoordinate(coordinate, player);
				light.color = HIT_SHIP_PART_LIGHT_COLOR;
				light.intensity = SHIP_PART_LIGHT_INTENSITY;

				let shipPartGroup = shipPart.parent;
				animations.discoverShipPart(shipPartGroup);
			}

			let completed = animations.shakeBoard(this.board, coordinate, force);
			completed.then(() => {
				this.emit(VIEW_EVENT__SHOT_COMPLETED, {
					player
				});
			});
		});
	}

	onPlayerActivationChanged (eventName, data, player) {
		let isActive = data.newValue;
		if (!isActive) {
			player.canPlay = false;
			return;
		}

		this.onPlayerActivated(player);
	}

	onPlayerActivated (player) {
		let completed = animations.revealBoard(this.board, player);

		completed.then(() => {
			player.canPlay = true;
			this.emit(VIEW_EVENT__BOARD_READY, {
				player
			});
		});
	}

	getCellAtCoordinate (coordinate) {
		return this.board.children.filter(cellPivot => {
			let cell = cellPivot.getObjectByName('cell');
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
