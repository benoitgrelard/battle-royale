import THREE from 'three';
import geometries, { TILE_SIZE, TILE_HEIGHT, SHIP_PART_SIZE } from './geometries';
import materials from './materials';
import lights from './lights';
import Coordinate from '../models/Coordinate';


export const CELL_GAP = 0.5;
export const MISSILE_DROP_HEIGHT = 5;
export default {
	makeBoard,
	makeCell,
	makeCellSide,
	makeTile,
	makeShipPart,
	makeMissile
};


function makeBoard(gameModel) {
	'use strict';

	const BOARD_SIZE = (gameModel.boardSize * TILE_SIZE) + ((gameModel.boardSize - 1) * CELL_GAP);

	let boardObject = new THREE.Group();
	boardObject.name = 'board';

	for (let y=0; y<gameModel.boardSize; y++) {
		for (let x=0; x<gameModel.boardSize; x++) {

			let cellObject = makeCell(gameModel, x, y);

			let initialOffset = TILE_SIZE/2;
			let incrementOffset = TILE_SIZE + CELL_GAP;
			let centerInBoardOffset = -BOARD_SIZE/2;

			cellObject.translateX(initialOffset + x * incrementOffset + centerInBoardOffset);
			cellObject.translateZ(initialOffset + y * incrementOffset + centerInBoardOffset);

			boardObject.add(cellObject);
		}
	}

	return boardObject;
}

function makeCell(gameModel, x, y) {
	'use strict';

	let cellPivot = new THREE.Group();
	cellPivot.name = 'cellPivot';

	let cellObject = new THREE.Group();
	cellObject.name = 'cell';
	cellObject.userData = { x, y };

	let humanCellSide = makeCellSide(gameModel.humanPlayer, x, y);
	let computerCellSide = makeCellSide(gameModel.computerPlayer, x, y);
	computerCellSide.rotateX(Math.PI);

	cellObject.add(humanCellSide, computerCellSide);
	cellPivot.add(cellObject);

	return cellPivot;
}

function makeCellSide(playerModel, x, y) {
	'use strict';

	let cellSideObject = new THREE.Group();
	cellSideObject.name = `cellSide--${playerModel.type}`;

	let tile = makeTile(playerModel, x, y);
	tile.translateY(TILE_HEIGHT/2);

	cellSideObject.add(tile);

	return cellSideObject;
}

function makeTile(playerModel, x, y) {
	'use strict';

	let tileMesh = new THREE.Mesh(geometries.tile, materials.tile.default);
	tileMesh.name = 'tile';
	tileMesh.receiveShadow = true;

	let coordinate = new Coordinate({ x, y });
	let hasShipPart = playerModel.board.hasShipPartAtCoordinate(coordinate);

	if (hasShipPart) {
		let shipPartObject = makeShipPart(playerModel, x, y);
		tileMesh.add(shipPartObject);
	}

	return tileMesh;
}

function makeShipPart(playerModel, x, y) {
	'use strict';

	let shipPartObject = new THREE.Group();

	let shipPartMesh = new THREE.Mesh(geometries.shipPart, materials.shipPart.default);
	shipPartMesh.name = 'shipPart';
	shipPartMesh.castShadow = true;
	shipPartMesh.visible = playerModel.type === 'human';
	shipPartObject.add(shipPartMesh);

	let light = lights.makeShipPart();
	light.name = 'light';
	shipPartObject.add(light);

	shipPartObject.translateY((SHIP_PART_SIZE + TILE_HEIGHT) / 2);

	return shipPartObject;
}

function makeMissile() {
	'use strict';

	let missileObject = new THREE.Group();

	let missileMesh = new THREE.Mesh(geometries.missile, materials.missile);
	missileMesh.name = 'missile';
	missileObject.add(missileMesh);

	let line = new THREE.Line(geometries.missileLine, materials.missileLine);
	line.name = 'line';
	line.translateY(-MISSILE_DROP_HEIGHT);
	missileObject.add(line);

	let light = lights.makeMissile();
	light.name = 'light';
	missileObject.add(light);

	return missileObject;
}
