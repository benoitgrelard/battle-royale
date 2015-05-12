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
		this.model.humanPlayer.on(EVENT_SHOT, this.onHumanPlayerShot.bind(this));
		this.model.computerPlayer.on(EVENT_SHOT, this.onComputerPlayerShot.bind(this));
	}

	onHumanPlayerRequestedShoot (eventName, data) {
		let { x, y } = data.coordinate;
		let coordinate = new Coordinate(x, y);
		this.model.computerPlayer.takeHit(coordinate);
	}

	onHumanPlayerShot (eventName, data) {
		this.onPlayerShot(this.model.humanPlayer, eventName, data);
	}

	onComputerPlayerShot (eventName, data) {
		this.onPlayerShot(this.model.computerPlayer, eventName, data);
	}

	onPlayerShot (targetPlayer, eventName, data) {
		let gameOver = this.checkWinner();
		if (gameOver) { return; }

		this.giveTurnTo(targetPlayer);
	}

	giveTurnTo (player) {
		this.getOpponent(player).deactivate();
		player.activate();

		if (player === this.model.computerPlayer) {
			let coordinate = this.ai.chooseCoordinate();
			this.model.humanPlayer.takeHit(coordinate);
		}
	}

	getOpponent (player) {
		return player === this.model.humanPlayer ? this.model.computerPlayer : this.model.humanPlayer;
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

}
