import THREE from 'three';
import TWEEN from 'tween.js';
import Coordinate from '../../models/Coordinate';
import Cell from './Cell';
import { TILE_SIZE } from './Tile';
import { ANIMATION_SPEED_FACTOR } from '../../constants';


export const CELL_GAP = 0.5;

/**
 * @class Board
 */
export default class Board extends THREE.Group {

	constructor(gameModel) {
		super();

		this.name = 'board';

		const BOARD_SIZE = (gameModel.boardSize * TILE_SIZE) + ((gameModel.boardSize - 1) * CELL_GAP);

		for (let y = 0; y < gameModel.boardSize; y++) {
			for (let x = 0; x < gameModel.boardSize; x++) {
				const coordinate = new Coordinate({ x, y });
				const cellObject = new Cell(gameModel, coordinate);

				const initialOffset = TILE_SIZE / 2;
				const incrementOffset = TILE_SIZE + CELL_GAP;
				const centerInBoardOffset = -BOARD_SIZE / 2;

				cellObject.translateX(initialOffset + x * incrementOffset + centerInBoardOffset);
				cellObject.translateZ(initialOffset + y * incrementOffset + centerInBoardOffset);

				this.add(cellObject);
			}
		}
	}

	takeHit(playerModel, coordinate, hit, sunk, ship) {
		const missed = !hit;
		const force = missed ? 1 : sunk ? 6 : hit ? 3 : 0; // eslint-disable-line
		const tile = this.getCell(coordinate).getSide(playerModel).tile;

		if (missed) {
			tile.markAsMissed();
		} else if (sunk) {
			this.sinkShip(playerModel, ship);
		} else if (hit) {
			tile.shipPart.takeHit();
		}

		const animationCompletePromise = this.animateImpact(coordinate, force);

		return animationCompletePromise;
	}

	getCell(coordinate) {
		return this.children.filter(cellPivot =>
			cellPivot.cell.userData.x === coordinate.x &&
			cellPivot.cell.userData.y === coordinate.y
		)[0];
	}

	sinkShip(playerModel, ship) {
		const shipPartCoordinates = playerModel.board.getAllShipPartCoordinates(ship);
		shipPartCoordinates.forEach(coordinate => {
			const shipPart = this.getCell(coordinate).getSide(playerModel).tile.shipPart;
			shipPart.sink();
		});
	}

	hover(time) {
		// this.rotation.y += 0.00025;

		this.children.forEach(cellPivot => {
			const { x, y } = cellPivot.cell.userData;
			cellPivot.position.y = Math.sin(time / 1000 + (x + y) / 5) * 0.35; // eslint-disable-line
		});
	}

	showSide(playerModel) {
		function animateCell(cells, cell, index, isHuman, angle, resolve) {
			const { x, y } = cell.userData;
			const size = Math.sqrt(cells.length);
			const circularDistance =
				Math.sqrt(Math.pow(isHuman ? x : size - x, 2) + Math.pow(isHuman ? y : size - y, 2));

			const tween = new TWEEN.Tween(cell.rotation)
				.to({ x: String(angle) }, 2000 / ANIMATION_SPEED_FACTOR)
				.delay(circularDistance * 20 / ANIMATION_SPEED_FACTOR)
				.easing(TWEEN.Easing.Elastic.Out)
				.start();

			if (index === (isHuman ? cells.length - 1 : 0)) {
				tween.onComplete(() => resolve());
			}
		}

		const promise = new Promise(resolve => {
			const cells = this.children.map(cellPivot => cellPivot.cell);
			const isHuman = playerModel.type === 'human';
			const angle = isHuman ? Math.PI : -Math.PI;

			cells.forEach((cell, index) => animateCell(cells, cell, index, isHuman, angle, resolve));
		});

		return promise;
	}

	animateImpact(impactCoordinate, force) {
		function animateCell(cell, index, cells, resolve) {
			const { x: xP, y: yP } = impactCoordinate;
			const { x, y } = cell.userData;
			const circularDistanceFromImpact = Math.sqrt(Math.pow(xP - x, 2) + Math.pow(yP - y, 2));

			const { x: rotX, z: rotZ } = cell.rotation;
			const props = { posY: 0, rotX, rotZ };

			const tween = new TWEEN.Tween(props)
				.to({
					posY: [
						cell.position.y,
						(10 - circularDistanceFromImpact) * -0.1 * force,
						cell.position.y
					],
					rotX: [rotX, rotX + THREE.Math.degToRad((yP - y) * 2 * force), rotX],
					rotZ: [rotZ, rotZ + THREE.Math.degToRad((xP - x) * 2 * force), rotZ]
				}, 2000 / ANIMATION_SPEED_FACTOR)
				.delay(circularDistanceFromImpact * 20 / ANIMATION_SPEED_FACTOR)
				.easing(TWEEN.Easing.Elastic.Out)
				.onUpdate(() => {
					cell.position.y = props.posY; // eslint-disable-line
					cell.rotation.x = props.rotX; // eslint-disable-line
					cell.rotation.z = props.rotZ; // eslint-disable-line
				})
				.start();

			if (index === cells.length - 1) {
				tween.onComplete(() => resolve());
			}
		}

		const promise = new Promise(resolve => {
			const cells = this.children.map(cellPivot => cellPivot.cell);
			cells.forEach((cell, index) => animateCell(cell, index, cells, resolve));
		});

		return promise;
	}

}
