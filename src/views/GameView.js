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


/**
 * @class GameView
 */
export default class GameView extends View {

	constructor(model, element) {
		super(model, element);

		this.scene = this.getScene();
		this.camera = this.getCamera();
		this.controls = this.getControls(this.camera);
		this.renderer = this.getRenderer(this.camera);

		this.initSize();

		this.addEventListeners();

		// kick-off rendering
		this.rootElement.appendChild(this.renderer.domElement);
		this.render();
		this.animate();
	}

	getScene() {
		const scene = new THREE.Scene();

		this.scenelights = this.getSceneLights();
		scene.add(...this.scenelights);

		this.board = new Board(this.model);
		scene.add(this.board);

		this.missile = new Missile();
		scene.add(this.missile);

		this.fog = new THREE.FogExp2(0x111111, 0.02);
		scene.fog = this.fog;

		// scene.add(new THREE.AxisHelper());

		/* this.scenelights.forEach(light => {
			if (light.type !== 'SpotLight') { return; }
			scene.add(new THREE.SpotLightHelper(light));
		}); */

		return scene;
	}

	getSceneLights() {
		const ambientLight = new THREE.AmbientLight(0x222222);

		const topLight = new THREE.SpotLight(0xffffff, 0.5, 50, Math.PI / 6, 1);
		topLight.position.set(5, 30, 5);

		const redLight = new THREE.SpotLight(0xff0000, 0.65, 50, Math.PI / 8);
		redLight.position.set(-30, 5, 15);

		const blueLight = new THREE.SpotLight(0x0000ff, 0.65, 50, Math.PI / 8);
		blueLight.position.set(-30, 5, -15);

		return [
			ambientLight,
			topLight,
			redLight,
			blueLight
		];
	}

	getCamera() {
		const camera = new THREE.PerspectiveCamera(
			45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.x = -10;
		camera.position.y = 18;
		camera.position.z = 17;

		return camera;
	}

	getControls(camera) {
		const OrbitControls = createOrbitControls(THREE);
		return new OrbitControls(camera);
	}

	getRenderer() {
		const renderer = new THREE.WebGLRenderer({
			antialias: true
		});

		renderer.setClearColor(0x111111);
		// renderer.setPixelRatio(window.devicePixelRatio);

		return renderer;
	}

	initSize() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		window.addEventListener('resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	animate(time) {
		window.requestAnimationFrame(this.animate.bind(this));

		TWEEN.update();
		this.controls.update();
		this.board.hover(time);

		this.render();
	}

	addEventListeners() {
		// view events
		this.rootElement.addEventListener('mousemove', this.handleMouseMovedOverView.bind(this));
		this.rootElement.addEventListener('mousedown', this.handleViewClicked.bind(this));

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.humanPlayer.on('changed:isActive', this.onPlayerActivationChanged.bind(this));
		this.model.computerPlayer.on('changed:isActive', this.onPlayerActivationChanged.bind(this));
	}

	handleMouseMovedOverView(event) {
		this.rootElement.style.cursor = 'default';
		if (!this.model.humanPlayer.canPlay) { return; }

		const hoveredTile = this.getIntersectedComputerTileFromEvent(event);

		this.rootElement.style.cursor = hoveredTile ? 'pointer' : 'default';
	}

	handleViewClicked(event) {
		if (!this.model.humanPlayer.canPlay) { return; }

		const clickedTile = this.getIntersectedComputerTileFromEvent(event);

		if (!clickedTile) { return; }

		const { x, y } = clickedTile.parent.parent.userData;

		this.emit(VIEW_EVENT__SHOOT_REQUESTED, {
			coordinate: new Coordinate({ x, y })
		});

		this.model.humanPlayer.canPlay = false;
	}

	getIntersectedComputerTileFromEvent(event) {
		const mouseVector = new THREE.Vector2();
		const raycaster = new THREE.Raycaster();

		mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
		mouseVector.y = 1 - 2 * (event.clientY / window.innerHeight);

		raycaster.setFromCamera(mouseVector, this.camera);

		const computerTiles = this.board.children
			.map(cell => cell.getSide(this.model.computerPlayer).tile);
		const intersections = raycaster.intersectObjects(computerTiles);
		const intersectedComputerTiles = intersections.map(intersection => intersection.object);

		return intersectedComputerTiles.length ? intersectedComputerTiles[0] : null;
	}

	onPlayerShot(eventName, data, player) {
		const { coordinate, hit, sunk, ship } = data;
		const tile = this.board.getCell(coordinate).getSide(player).tile;

		this.missile.positionOverTile(tile);
		const missileDropped = this.missile.drop();

		missileDropped.then(() => {
			const boardHit = this.board.takeHit(player, coordinate, hit, sunk, ship);

			boardHit.then(() => {
				this.emit(VIEW_EVENT__SHOT_COMPLETED, {
					player
				});
			});
		});
	}

	onPlayerActivationChanged(eventName, data, player) {
		const isActive = data.newValue;
		if (!isActive) {
			player.canPlay = false; // eslint-disable-line
			return;
		}

		this.onPlayerActivated(player);
	}

	onPlayerActivated(player) {
		const sideShown = this.board.showSide(player);

		sideShown.then(() => {
			player.canPlay = true; // eslint-disable-line
			this.emit(VIEW_EVENT__BOARD_READY, {
				player
			});
		});
	}

}
