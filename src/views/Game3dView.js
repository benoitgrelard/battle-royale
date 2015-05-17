import View from '../lib/View';
import THREE from 'three';
import orbitControls from 'three-orbit-controls';
import Coordinate from '../models/Coordinate';


const CELL_SIZE = 1;
const CELL_HEIGHT = 0.1;
const CELL_GAP = 0.5;
const SHIP_PART_SIZE = 0.5;

/**
 * @class  Game3dView
 */
export default class Game3dView extends View {

	constructor (model, element) {
		super(model, element);
		this.initialize();
	}

	initialize () {
		this.geometries = this.getGeometries();
		this.materials = this.getMaterials();
		this.scene = this.getScene(this.geometries, this.materials);
		this.camera = this.getCamera();
		this.controls = this.getControls(this.camera);
		this.renderer = this.getRenderer(this.camera);

		this.rootElement.appendChild(this.renderer.domElement);

		this.render();
	}

	getGeometries () {
		let cellGeometry = new THREE.BoxGeometry(CELL_SIZE, CELL_HEIGHT, CELL_SIZE);
		let shipPartGeometry = new THREE.BoxGeometry(SHIP_PART_SIZE, SHIP_PART_SIZE, SHIP_PART_SIZE);

		return {
			cellGeometry,
			shipPartGeometry
		};
	}

	getMaterials () {
		let cellMaterial = new THREE.MeshLambertMaterial({
			color: 0x009aff,
			wireframe: false,
			shading: THREE.FlatShading
		});

		let shipPartMaterial = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			wireframe: false,
			shading: THREE.FlatShading
		});

		return {
			cellMaterial,
			shipPartMaterial
		};
	}

	getScene (geometries, materials) {
		let scene = new THREE.Scene();

		let lights = this.getLights();
		scene.add(...lights);

		let board = this.getBoard(geometries, materials);
		scene.add(board);

		return scene;
	}

	getCamera () {
		let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 10;

		return camera;
	}

	getControls (camera) {
		let OrbitControls = orbitControls(THREE);
		return new OrbitControls(camera);
	}

	getRenderer (camera) {
		let renderer = new THREE.WebGLRenderer({
			antialias: false,
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
		let ambientLight = new THREE.AmbientLight(0x202020);

		let spotLight = new THREE.SpotLight(0xffffff);
		spotLight.position.set(8, 15, 15);
		spotLight.shadowCameraNear = 10;
		spotLight.shadowCameraFar = 50;
		spotLight.shadowCameraFov = 75;
		spotLight.castShadow = true;
		spotLight.shadowDarkness = 0.5;
		spotLight.shadowMapWidth = 2048;
		spotLight.shadowMapHeight = 2048;
		spotLight.shadowBias = 0.001;
		// spotLight.shadowCameraVisible = true;

		return [
			ambientLight,
			spotLight
		];
	}

	getBoard (geometries, materials) {
		const BOARD_SIZE = (this.model.boardSize * CELL_SIZE) + ((this.model.boardSize - 1) * CELL_GAP);

		let board = new THREE.Object3D();
		board.name = 'board';

		for (let y=0; y<this.model.boardSize; y++) {
			for (let x=0; x<this.model.boardSize; x++) {

				let coordinate = new Coordinate({ x, y });
				let hasShipPart = this.model.humanPlayer.board.hasShipPartAtCoordinate(coordinate);

				let cell = new THREE.Object3D();
				cell.name = 'cellContainer';
				let cellMesh = new THREE.Mesh(geometries.cellGeometry, materials.cellMaterial);
				cellMesh.name = 'cell';
				cellMesh.receiveShadow = true;

				if (hasShipPart) {
					let shipPartMesh = new THREE.Mesh(geometries.shipPartGeometry, materials.shipPartMaterial);
					shipPartMesh.name = 'shipPart';
					shipPartMesh.castShadow = true;
					shipPartMesh.translateY((SHIP_PART_SIZE + CELL_HEIGHT) / 2);
					cell.add(shipPartMesh);
				}

				cell.add(cellMesh);

				cell.translateX(x * (CELL_SIZE + CELL_GAP));
				cell.translateZ(y * (CELL_SIZE + CELL_GAP));

				board.add(cell);
			}
		}

		board.translateX(-BOARD_SIZE/2);
		board.translateZ(-BOARD_SIZE/2);

		return board;
	}

	render () {
		window.requestAnimationFrame(this.render.bind(this));

		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}

}
