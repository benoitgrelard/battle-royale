import View from '../lib/View';
import Coordinate from '../models/Coordinate';
import {
	VIEW_EVENT__SHOOT_REQUESTED,
	MODEL_EVENT__SHOT,
	VIEW_EVENT__SHOT_COMPLETED,
	CELL_MISSED
} from '../constants';


/**
 * @class GameView
 */
export default class GameView extends View {

	constructor (model, element) {
		super(model, element);

		// view events
		this.delegate('click', '.Board-cell', this.handleBoardCellClicked.bind(this));

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.humanPlayer.on('changed:activated', () => this.render());
		this.model.computerPlayer.on('changed:activated', () => this.render());
	}

	handleBoardCellClicked (event) {
		if (!this.model.humanPlayer.activated) { return; }

		let cellElement = event.target;
		let { x, y } = cellElement.dataset;

		this.emit(VIEW_EVENT__SHOOT_REQUESTED, {
			coordinate: new Coordinate({ x, y })
		});
	}

	onPlayerShot (eventName, data, player) {
		this.render();
		this.emit(VIEW_EVENT__SHOT_COMPLETED, {
			player
		});
	}

	render () {
		let humanPlayer = this.model.humanPlayer;
		let computerPlayer = this.model.computerPlayer;
		let showShips = true;

		let output = `
			<div class="Player -human">
				<h1>${humanPlayer.name}</h1>
				${this.renderBoard(humanPlayer, showShips)}
			</div>

			<div class="Player -computer">
				<h1>${computerPlayer.name}</h1>
				${this.renderBoard(computerPlayer)}
			</div>
		`;

		this.rootElement.innerHTML = output;
	}

	renderBoard (player, showShips) {
		let board = player.board;
		let output = '';
		let typeModifer = player === this.model.humanPlayer ? '-human' : '-computer';
		let playableModifier = player.activated ? '' : '-playable';

		output += `<div class="Board ${typeModifer} ${playableModifier}">`;

		for (let y=0; y<board.grid.length; y++) {
			for (let x=0; x<board.grid.length; x++) {
				let coordinate = new Coordinate({ x, y });
				let hasShipPart = board.hasShipPartAtCoordinate(coordinate);
				let classModifier = '';
				if (hasShipPart) {
					let shipPart = board.getAtCoordinate(coordinate);
					if(shipPart.getShip().isSunk()) { classModifier += ' -sunk'; }
					else if (shipPart.isHit()) { classModifier += ' -hit'; }
					else if (showShips) { classModifier += ' -ship'; }
				} else {
					let isMissed = board.getAtCoordinate(coordinate) === CELL_MISSED;
					if (isMissed) { classModifier += ' -missed'; }
				}
				output += `<div class="Board-cell${classModifier}" data-x="${x}" data-y="${y}"></div>`;
			}
		}
		output += '</div>';

		return output;
	}

	destroy () {

	}

}
