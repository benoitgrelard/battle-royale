import View from '../lib/View';
import THREE from 'three';
import TWEEN from 'tween.js';
import orbitControls from 'three-orbit-controls';
import Coordinate from '../models/Coordinate';
import {
	VIEW_EVENT__SHOOT_REQUESTED,
	MODEL_EVENT__SHOT,
	VIEW_EVENT__SHOT_COMPLETED,
	VIEW_EVENT__BOARD_READY
} from '../constants';


const CELL_SIZE = 1;
const CELL_HEIGHT = 0.1;
const CELL_GAP = 0.5;
const SHIP_PART_SIZE = 0.75;

/**
 * @class  Game3dView
 */
export default class Game3dView extends View {

	constructor (model, element) {
		super(model, element);

		this.geometries = this.getGeometries();
		this.materials = this.getMaterials();
		this.scene = this.getScene(this.geometries, this.materials);
		this.camera = this.getCamera();
		this.controls = this.getControls(this.camera);
		this.renderer = this.getRenderer(this.camera);

		// kick-off rendering
		this.rootElement.appendChild(this.renderer.domElement);
		this.render();

		this.addEventListeners();
	}

	addEventListeners () {
		// view events
		this.rootElement.addEventListener('mousemove', this.handleMouseMovedOverView.bind(this));
		this.rootElement.addEventListener('click', this.handleViewClicked.bind(this));

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.humanPlayer.on('changed:activated', this.onPlayerActivationChanged.bind(this));
		this.model.computerPlayer.on('changed:activated', this.onPlayerActivationChanged.bind(this));
	}

	handleMouseMovedOverView (event) {
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
		let missed = !hit;
		let cellWrapper = this.getCellWrapperAtCoordinate(coordinate);
		let meshesToAnimate = [];

		if (missed) {
			let cell = cellWrapper.getObjectByName(`cell--${this.getPlayerType(player)}`);
			cell.material = this.materials.cellMaterialMissed;
			meshesToAnimate.push(cell);
		}

		else if (sunk) {
			let shipPartCoordinates = player.board.getAllShipPartCoordinates(ship);
			shipPartCoordinates.forEach(coordinate => {
				let cellWrapper = this.getCellWrapperAtCoordinate(coordinate);
				let shipPart = cellWrapper.getObjectByName(`shipPart--${this.getPlayerType(player)}`);
				shipPart.material = this.materials.shipPartMaterialSunk;
				shipPart.visible = true;

				meshesToAnimate.push(shipPart);
			});
		}

		else if (hit) {
			let shipPart = cellWrapper.getObjectByName(`shipPart--${this.getPlayerType(player)}`);
			shipPart.material = this.materials.shipPartMaterialHit;
			if (player === this.model.computerPlayer) {
				shipPart.visible = true;
			}
			meshesToAnimate.push(shipPart);
		}

		meshesToAnimate.forEach((mesh, index) => {

			let tween = new TWEEN.Tween(mesh.scale);

			tween
				.to({ x: [0, 1], y: [0, 1], z: [0, 1] }, 1000)
				.easing(TWEEN.Easing.Elastic.Out);

			if (index === meshesToAnimate.length-1) {
				tween.onComplete(() => {
					this.emit(VIEW_EVENT__SHOT_COMPLETED, {
						player
					});
				});
			}

			tween.start();

		});
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
		let angle = isHuman ? Math.PI : 0;

		cellWrappers.forEach((cellWrapper, index) => {

			let tween = new TWEEN.Tween(cellWrapper.rotation);
			let { x, y } = this.getCoordinateForIndex( isHuman ? index : cellWrappers.length - 1 - index);
			let size = this.model.boardSize;
			let delay = 30 * Math.round( Math.sqrt( Math.pow(-x - (size - 1)/2, 2) ) + Math.sqrt( Math.pow(-y - (size - 1)/2, 2) ) );
			// let delay = 20 * ((y + y%2) * size) + ((((y%2 * 2) - 1) * -1) * x);
			// let delay = 15 * (isHuman ? index : cellWrappers.length-index);

			tween
				.to({ x: angle }, 1000)
				.delay(delay)
				.easing(TWEEN.Easing.Elastic.Out);

			if (index === cellWrappers.length-1) {
				tween.onComplete(() => {
					this.emit(VIEW_EVENT__BOARD_READY, {
						player
					});
				});
			}

			tween.start();

		});
	}

	getCoordinateForIndex (index) {
		let y = Math.floor(index / this.model.boardSize);
		let x = index - y * this.model.boardSize;

		return { x, y };
	}

	getCellWrapperAtCoordinate (coordinate) {
		return this.board.children.filter(cellWrapper => {
			return cellWrapper.userData.x === coordinate.x && cellWrapper.userData.y === coordinate.y;
		})[0];
	}

	getGeometries () {
		let cellGeometry = new THREE.BoxGeometry(CELL_SIZE, CELL_HEIGHT/2, CELL_SIZE);
		let shipPartGeometry = new THREE.IcosahedronGeometry(SHIP_PART_SIZE/2, 0);
		shipPartGeometry.computeBoundingBox();

		return {
			cellGeometry,
			shipPartGeometry
		};
	}

	getMaterials () {
		let cellMaterialDefault = new THREE.MeshLambertMaterial({
			color: 0xeeeeee,
			wireframe: false,
			shading: THREE.FlatShading
		});

		let cellMaterialMissed = new THREE.MeshLambertMaterial({
			color: 'blue',
			wireframe: false,
			shading: THREE.FlatShading
		});

		let shipPartMaterialDefault = new THREE.MeshLambertMaterial({
			color: 0x999999,
			wireframe: false,
			shading: THREE.FlatShading
		});

		let shipPartMaterialHit = new THREE.MeshLambertMaterial({
			color: 'red',
			wireframe: false,
			shading: THREE.FlatShading
		});

		let shipPartMaterialSunk = new THREE.MeshLambertMaterial({
			color: 'black',
			wireframe: false,
			shading: THREE.FlatShading
		});

		return {
			cellMaterialDefault,
			cellMaterialMissed,
			shipPartMaterialDefault,
			shipPartMaterialHit,
			shipPartMaterialSunk
		};
	}

	getScene (geometries, materials) {
		let scene = new THREE.Scene();

		this.lights = this.getLights();
		scene.add(...this.lights);

		this.board = this.getBoard(geometries, materials);
		scene.add(this.board);

		this.addPlayerShipsToBoard(this.board, this.model.humanPlayer, geometries, materials);
		this.addPlayerShipsToBoard(this.board, this.model.computerPlayer, geometries, materials);

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
		let OrbitControls = orbitControls(THREE);
		return new OrbitControls(camera);
	}

	getRenderer (camera) {
		let renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

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

	getLights () {
		let skyLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.15);
		// skyLight.color.setHSL(0.6, 1, 0.6);
		// skyLight.groundColor.setHSL(0.095, 1, 0.75);
		skyLight.position.set(0, 500, 0);

		let spotLight = new THREE.SpotLight(0xffffff, 0.65);
		spotLight.position.set(30, 30, 10);
		spotLight.castShadow = true;
		spotLight.shadowDarkness = 0.75;
		spotLight.shadowCameraNear = 10;
		spotLight.shadowCameraFar = 100;
		spotLight.shadowCameraFov = 45;
		spotLight.shadowMapWidth = 2048;
		spotLight.shadowMapHeight = 2048;
		spotLight.shadowBias = 0.001;
		// spotLight.shadowCameraVisible = true;

		let spotLight2 = new THREE.SpotLight(0xff0000, 0.5);
		spotLight2.position.set(-10, 2, 10);

		let spotLight3 = new THREE.SpotLight(0x0000ff, 0.5);
		spotLight3.position.set(10, 2, -10);

		return [
			skyLight,
			spotLight
			// spotLight2,
			// spotLight3
		];
	}

	getBoard (geometries, materials) {
		const BOARD_SIZE = (this.model.boardSize * CELL_SIZE) + ((this.model.boardSize - 1) * CELL_GAP);

		let board = new THREE.Group();
		board.name = 'board';

		for (let y=0; y<this.model.boardSize; y++) {
			for (let x=0; x<this.model.boardSize; x++) {

				let cellWrapper = new THREE.Group();
				cellWrapper.name = 'cellWrapper';
				cellWrapper.userData = { x, y };

				let cellHuman = new THREE.Mesh(geometries.cellGeometry, materials.cellMaterialDefault);
				cellHuman.name = 'cell--human';
				cellHuman.userData = { x, y };
				cellHuman.receiveShadow = true;

				let cellComputer = cellHuman.clone();
				cellComputer.name = 'cell--computer';

				cellWrapper.add(cellHuman);
				cellWrapper.add(cellComputer);

				cellHuman.translateY(CELL_HEIGHT/4);
				cellComputer.translateY(-CELL_HEIGHT/4);

				let initialOffset = CELL_SIZE/2;
				let incrementOffset = CELL_SIZE + CELL_GAP;
				let centerInBoardOffset = -BOARD_SIZE/2;

				cellWrapper.translateX(initialOffset + x * incrementOffset + centerInBoardOffset);
				cellWrapper.translateZ(initialOffset + y * incrementOffset + centerInBoardOffset);

				board.add(cellWrapper);
			}
		}

		return board;
	}

	addPlayerShipsToBoard (board, player, geometries, materials) {
		board.children.forEach(cellWrapper => {

			let { x, y } = cellWrapper.userData;
			let coordinate = new Coordinate({ x, y });
			let hasShipPart = player.board.hasShipPartAtCoordinate(coordinate);
			let side = player === this.model.humanPlayer ? 1 : -1;

			if (hasShipPart) {
				let shipPart = new THREE.Mesh(geometries.shipPartGeometry, materials.shipPartMaterialDefault);
				shipPart.name = `shipPart--${this.getPlayerType(player)}`;
				shipPart.castShadow = true;
				shipPart.translateY(side * (geometries.shipPartGeometry.boundingBox.size().y + CELL_HEIGHT) / 2);

				if (player === this.model.computerPlayer) {
					shipPart.visible = false;
				}

				cellWrapper.add(shipPart);
			}

		});
	}

	getPlayerType (player) {
		return player === this.model.humanPlayer ? 'human': 'computer';
	}

	render () {
		this.controls.update();
		TWEEN.update();

		this.renderer.render(this.scene, this.camera);

		window.requestAnimationFrame(this.render.bind(this));
	}

}
