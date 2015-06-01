import THREE from 'three';
import geometries, { TILE_SIZE, TILE_HEIGHT } from './geometries';
import materials from './materials';
import Coordinate from '../models/Coordinate';
import ShipPart from '../views/objects/ShipPart';


export const CELL_GAP = 0.5;
export default {
	makeBoard,
	makeCell,
	makeCellSide,
	makeTile
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
		let shipPart = new ShipPart(playerModel);
		tileMesh.add(shipPart);
	}

	return tileMesh;
}
