import View from '../lib/View';
import Coordinate from '../models/Coordinate';
import {
	VIEW_EVENT__SHOOT_REQUESTED,
	MODEL_EVENT__SHOT,
	VIEW_EVENT__SHOT_COMPLETED,
	VIEW_EVENT__BOARD_READY,
	CELL_MISSED
} from '../constants';

import './GameDebugView.scss';


/**
 * @class GameDebugView
 */
export default class GameDebugView extends View {

	constructor(model, element) {
		super(model, element);

		// view events
		this.delegate('click', '.Board-cell', this.handleBoardCellClicked.bind(this));

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.humanPlayer.on('changed:isActive', this.onPlayerActivationChanged.bind(this));
		this.model.computerPlayer.on('changed:isActive', this.onPlayerActivationChanged.bind(this));
		this.model.humanPlayer.on('changed:canPlay', this.render.bind(this));
		this.model.computerPlayer.on('changed:canPlay', this.render.bind(this));
	}

	handleBoardCellClicked(event) {
		if (!this.model.humanPlayer.canPlay) { return; }

		const cellElement = event.target;
		const { x, y } = cellElement.dataset;

		this.emit(VIEW_EVENT__SHOOT_REQUESTED, {
			coordinate: new Coordinate({ x, y })
		});
	}

	onPlayerShot(eventName, data, player) {
		this.render();

		this.emit(VIEW_EVENT__SHOT_COMPLETED, {
			player
		});

		this.emit(VIEW_EVENT__BOARD_READY, {
			player
		});
	}

	onPlayerActivationChanged(eventName, data, player) {
		const isActive = data.newValue;
		player.canPlay = isActive; // eslint-disable-line
	}

	render() {
		const humanPlayer = this.model.humanPlayer;
		const humanPlayerScore = this.model.computerPlayer.getDamages();

		const computerPlayer = this.model.computerPlayer;
		const computerPlayerScore = this.model.humanPlayer.getDamages();

		const showShips = true;

		const output = `
			<div class="Player -human">
				<h1>${humanPlayer.name} (${humanPlayerScore})</h1>
				${this.renderBoard(humanPlayer, showShips)}
			</div>

			<div class="Player -computer">
				<h1>${computerPlayer.name} (${computerPlayerScore})</h1>
				${this.renderBoard(computerPlayer)}
			</div>
		`;

		this.rootElement.innerHTML = output;
	}

	renderBoard(player, showShips) {
		const board = player.board;
		let output = '';
		const typeModifer = player === this.model.humanPlayer ? '-human' : '-computer';
		const playableModifier = player.canPlay ? '' : '-playable';

		output += `<div class="Board ${typeModifer} ${playableModifier}">`;

		for (let y = 0; y < board.grid.length; y++) {
			for (let x = 0; x < board.grid.length; x++) {
				const coordinate = new Coordinate({ x, y });
				const hasShipPart = board.hasShipPartAtCoordinate(coordinate);
				let classModifier = '';
				if (hasShipPart) {
					const shipPart = board.getAtCoordinate(coordinate);
					if (shipPart.getShip().isSunk()) {
						classModifier += ' -sunk';
					} else if (shipPart.isHit()) {
						classModifier += ' -hit';
					} else if (showShips) {
						classModifier += ' -ship';
					}
				} else {
					const isMissed = board.getAtCoordinate(coordinate) === CELL_MISSED;
					if (isMissed) { classModifier += ' -missed'; }
				}
				output += `<div class="Board-cell${classModifier}" data-x="${x}" data-y="${y}"></div>`;
			}
		}
		output += '</div>';

		return output;
	}

	destroy() {

	}

}
