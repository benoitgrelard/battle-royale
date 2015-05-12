import Coordinate from 'src/models/Coordinate';
import AI from 'src/lib/AI';
import { EVENT_SHOOT_REQUESTED, EVENT_SHOT } from 'src/constants';


/**
 * @class GameController
 */
export default class GameController {

	constructor (model, view) {
		this.model = model;
		this.view = view;
		this.ai = new AI(this.model.humanPlayer.boardSize);

		this.giveTurnTo(this.model.humanPlayer);

		// view events
		this.view.on(EVENT_SHOOT_REQUESTED, this.onHumanPlayerRequestedShoot.bind(this));

		// model events
		this.model.humanPlayer.on(EVENT_SHOT, this.onPlayerShot.bind(this));
		this.model.computerPlayer.on(EVENT_SHOT, this.onPlayerShot.bind(this));
	}

	onHumanPlayerRequestedShoot (eventName, data) {
		let { x, y } = data.coordinate;
		let coordinate = new Coordinate(x, y);
		this.model.computerPlayer.takeHit(coordinate);
	}

	onPlayerShot (eventName, data, player) {
		let gameOver = this.checkWinner();
		if (gameOver) { return; }

		this.giveTurnTo(player);
	}

	giveTurnTo (player) {
		this.getOpponent(player).deactivate();
		player.activate();

		if (this.isComputer(player)) {
			let coordinate = this.ai.chooseCoordinate();
			this.model.humanPlayer.takeHit(coordinate);
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

		this.model.humanPlayer.deactivate();
		this.model.computerPlayer.deactivate();

		return true;
	}

	isHuman (player) {
		return player === this.model.humanPlayer;
	}

	isComputer (player) {
		return player === this.model.computerPlayer;
	}

}
