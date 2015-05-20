import Coordinate from '../models/Coordinate';
import AI, { CONST_AI_DELAY } from '../lib/AI';
import { VIEW_EVENT__SHOOT_REQUESTED, MODEL_EVENT__SHOT, VIEW_EVENT__SHOT_COMPLETED } from '../constants';


/**
 * @class GameController
 */
export default class GameController {

	constructor (model, view) {
		this.model = model;
		this.view = view;
		this.ai = new AI(this.model.boardSize);

		// delay initial turn
		setTimeout(() => this.giveTurnTo(this.model.humanPlayer), 2000);

		// view events
		this.view.on(VIEW_EVENT__SHOOT_REQUESTED, this.onHumanPlayerRequestedShoot.bind(this));
		this.view.on(VIEW_EVENT__SHOT_COMPLETED, this.onPlayerShotCompleted.bind(this));

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
		window.console.log(this.getInfoMessage(data, player));
		let gameOver = this.checkWinner();
		if (gameOver) { return; }
	}

	onPlayerShotCompleted (eventName, data) {
		this.giveTurnTo(data.player);
	}

	giveTurnTo (player) {
		window.console.log(`${player.name}’s turn!`);
		this.getOpponent(player).activated = false;
		player.activated = true;

		if (this.isComputer(player)) {
			let coordinate = this.ai.chooseCoordinate();

			setTimeout(() => {
				let result = this.model.humanPlayer.takeHit(coordinate);
				let { hit, sunk } = result;
				this.ai.updateHitMapAtCoordinate(coordinate, hit, sunk);
			}, CONST_AI_DELAY);
		}
	}

	getOpponent (player) {
		return this.isHuman(player) ? this.model.computerPlayer : this.model.humanPlayer;
	}

	checkWinner () {
		let humanPlayerIsSunk = this.model.humanPlayer.isSunk();
		let computerPlayerIsSunk = this.model.computerPlayer.isSunk();

		if (!humanPlayerIsSunk && !computerPlayerIsSunk) { return false; }

		window.alert((humanPlayerIsSunk ? this.model.computerPlayer : this.model.humanPlayer).name + ' wins!');

		this.model.humanPlayer.activated = false;
		this.model.computerPlayer.activated = false;

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
