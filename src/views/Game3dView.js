import THREE from 'three';
import TWEEN from 'tween.js';
import View from '../lib/View';
import createOrbitControls from 'three-orbit-controls';
import Coordinate from '../models/Coordinate';
import {
	VIEW_EVENT__SHOOT_REQUESTED,
	MODEL_EVENT__SHOT,
	VIEW_EVENT__SHOT_COMPLETED,
	VIEW_EVENT__BOARD_READY
} from '../constants';
import Board from './objects/Board';
import Missile from './objects/Missile';
// import { log3d } from '../lib/helpers';


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
		this.animate();
	}

	getScene () {
		let scene = new THREE.Scene();

		this.scenelights = this.getSceneLights();
		scene.add(...this.scenelights);

		this.board = new Board(this.model);
		scene.add(this.board);

		this.missile = new Missile();
		scene.add(this.missile);

		this.fog = new THREE.FogExp2(0x111111, 0.02);
		scene.fog = this.fog;

		// scene.add(new THREE.AxisHelper());

		/*this.scenelights.forEach(light => {
			if (light.type !== 'SpotLight') { return; }
			scene.add(new THREE.SpotLightHelper(light));
		});*/

		return scene;
	}

	getSceneLights () {
		let ambientLight = new THREE.AmbientLight(0x222222);

		let topLight = new THREE.SpotLight(0xffffff, 0.65, 50, Math.PI/6, 1);
		topLight.position.set(5, 30, 5);
		topLight.castShadow = true;
		topLight.shadowDarkness = 0.85;
		topLight.shadowCameraNear = 10;
		topLight.shadowCameraFar = 40;
		topLight.shadowCameraFov = 45;
		topLight.shadowMapWidth = 2048;
		topLight.shadowMapHeight = 2048;
		topLight.shadowBias = 0.001;
		// topLight.shadowCameraVisible = true;

		let redLight = new THREE.SpotLight(0xff0000, 0.65, 50, Math.PI/8);
		redLight.position.set(-30, 5, 15);

		let blueLight = new THREE.SpotLight(0x0000ff, 0.65, 50, Math.PI/8);
		blueLight.position.set(-30, 5, -15);

		return [
			ambientLight,
			topLight,
			redLight,
			blueLight
		];
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
		this.renderer.render(this.scene, this.camera);
	}

	animate (time) {
		window.requestAnimationFrame(this.animate.bind(this));

		TWEEN.update();
		this.controls.update();
		this.board.hover(time);

		this.render(time);
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
		let tile = this.board.getTile(coordinate, player);

		this.missile.positionOverTile(tile);
		let missileDropped = this.missile.drop();

		missileDropped.then(() => {

			let boardHit = this.board.takeHit(coordinate, player, hit, sunk, ship);

			boardHit.then(() => {
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
		let completed = this.board.reveal(player);

		completed.then(() => {
			player.canPlay = true;
			this.emit(VIEW_EVENT__BOARD_READY, {
				player
			});
		});
	}

}
