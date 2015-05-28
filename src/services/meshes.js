import THREE from 'three';
import geometries, { CELL_SIZE, CELL_HEIGHT } from './geometries';
import materials from './materials';
import Coordinate from '../models/Coordinate';


export const CELL_GAP = 0.5;
export default {
	makeCell,
	makeShipPart,
	makeBoard
};


function makeBoard(gameModel) {
	'use strict';

	const BOARD_SIZE = (gameModel.boardSize * CELL_SIZE) + ((gameModel.boardSize - 1) * CELL_GAP);

	let boardMesh = new THREE.Group();
	boardMesh.name = 'board';

	for (let y=0; y<gameModel.boardSize; y++) {
		for (let x=0; x<gameModel.boardSize; x++) {

			let cellWrapperMesh = new THREE.Group();
			cellWrapperMesh.name = 'cellWrapper';
			cellWrapperMesh.userData = { x, y };

			let humanCellMesh = new THREE.Mesh(geometries.cell, materials.cell.default);
			humanCellMesh.name = 'cell--human';
			humanCellMesh.userData = { x, y };
			humanCellMesh.receiveShadow = true;

			let computerCellMesh = humanCellMesh.clone();
			computerCellMesh.name = 'cell--computer';

			cellWrapperMesh.add(humanCellMesh);
			cellWrapperMesh.add(computerCellMesh);

			humanCellMesh.translateY(CELL_HEIGHT/4);
			computerCellMesh.translateY(-CELL_HEIGHT/4);

			let initialOffset = CELL_SIZE/2;
			let incrementOffset = CELL_SIZE + CELL_GAP;
			let centerInBoardOffset = -BOARD_SIZE/2;

			cellWrapperMesh.translateX(initialOffset + x * incrementOffset + centerInBoardOffset);
			cellWrapperMesh.translateZ(initialOffset + y * incrementOffset + centerInBoardOffset);

			boardMesh.add(cellWrapperMesh);
		}
	}

	addPlayerShipsToBoard(boardMesh, gameModel.humanPlayer);
	addPlayerShipsToBoard(boardMesh, gameModel.computerPlayer);

	return boardMesh;
}

/*function makeBoardSide(playerModel) {
	'use strict';
}*/

function makeCell() {
	'use strict';
}

function makeShipPart() {
	'use strict';
}

function addPlayerShipsToBoard(boardMesh, playerModel) {
	'use strict';

	boardMesh.children.forEach(cellWrapperMesh => {

		let { x, y } = cellWrapperMesh.userData;
		let coordinate = new Coordinate({ x, y });
		let hasShipPart = playerModel.board.hasShipPartAtCoordinate(coordinate);
		let side = playerModel.type === 'human' ? 1 : -1;

		if (hasShipPart) {
			let shipPartMesh = new THREE.Mesh(geometries.shipPart, materials.shipPart.default);
			shipPartMesh.name = `shipPart--${playerModel.type}`;
			shipPartMesh.castShadow = true;
			shipPartMesh.translateY(side * (geometries.shipPart.boundingBox.size().y + CELL_HEIGHT) / 2);
			// shipPartMesh.translateY(side * CELL_HEIGHT);

			if (playerModel.type === 'computer') {
				shipPartMesh.visible = false;
			}

			/*let light = new THREE.PointLight(0xff0000, 0, 2);
			light.name = 'red-light';
			shipPartMesh.add(light);*/

			cellWrapperMesh.add(shipPartMesh);
		}

	});
}
