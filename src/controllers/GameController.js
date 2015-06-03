import Coordinate from '../models/Coordinate';
import AI, { CONST_AI_DELAY } from '../lib/AI';
import {
	VIEW_EVENT__SHOOT_REQUESTED,
	MODEL_EVENT__SHOT,
	VIEW_EVENT__SHOT_COMPLETED,
	VIEW_EVENT__BOARD_READY
} from '../constants';



/**
 * @class GameController
 */
export default class GameController {

	constructor (model, view) {
		this.model = model;
		this.view = view;
		this.ai = new AI(this.model.boardSize);
		this.verbose = false;

		// delay initial turn
		setTimeout(() => this.giveTurnTo(this.model.humanPlayer), 2000);

		// view events
		this.view.on(VIEW_EVENT__SHOOT_REQUESTED, this.onHumanPlayerRequestedShoot.bind(this));
		this.view.on(VIEW_EVENT__SHOT_COMPLETED, this.onPlayerShotCompleted.bind(this));
		this.view.on(VIEW_EVENT__BOARD_READY, this.onBoardReady.bind(this));

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.onPlayerShot.bind(this));
	}

	onHumanPlayerRequestedShoot (eventName, data) {
		let { x, y } = data.coordinate;
		let coordinate = new Coordinate({ x, y });
		this.model.computerPlayer.takeHit(coordinate);
	}

	onPlayerShot (eventName, data, player) {
		if (this.verbose) { window.console.log(this.getInfoMessage(data, player)); }
		let gameOver = this.checkWinner();
		if (gameOver) { return; }
	}

	onPlayerShotCompleted (eventName, data) {
		this.giveTurnTo(data.player);
	}

	onBoardReady (eventName, data) {
		if (this.isComputer(data.player) && data.player.canPlay) {
			let coordinate = this.ai.chooseCoordinate();

			setTimeout(() => {
				let result = this.model.humanPlayer.takeHit(coordinate);
				let { hit, sunk } = result;
				this.ai.updateHitMapAtCoordinate(coordinate, hit, sunk);
			}, CONST_AI_DELAY);
		}
	}

	giveTurnTo (player) {
		if (this.verbose) { window.console.log(`${player.name}’s turn!`); }
		this.getOpponent(player).isActive = false;
		player.isActive = true;
	}

	getOpponent (player) {
		return this.isHuman(player) ? this.model.computerPlayer : this.model.humanPlayer;
	}

	checkWinner () {
		let humanPlayerIsSunk = this.model.humanPlayer.isSunk();
		let computerPlayerIsSunk = this.model.computerPlayer.isSunk();

		if (!humanPlayerIsSunk && !computerPlayerIsSunk) { return false; }

		window.alert((humanPlayerIsSunk ? this.model.computerPlayer : this.model.humanPlayer).name + ' wins!');

		this.model.humanPlayer.isActive = false;
		this.model.computerPlayer.isActive = false;

		return true;
	}

	getInfoMessage (data, player) {
		let { hit, sunk, ship } = data;
		let opponentName = this.getOpponent(player).name;
		let message = '';

		if (hit) {
			message = `${opponentName} ${sunk ? 'sunk' : hit ? 'hit' : ''} ${player.name}’s ${ship.name}!`;
		} else {
			message = `${opponentName} missed!`;
		}

		return message;
	}

	isHuman (player) {
		return player === this.model.humanPlayer;
	}

	isComputer (player) {
		return player === this.model.computerPlayer;
	}

}
