import View from '../lib/View';
import {
	MODEL_EVENT__SHOT
} from '../constants';


/**
 * @class HudView
 */
export default class HudView extends View {

	constructor (model, element) {
		super(model, element);

		// model events
		this.model.humanPlayer.on(MODEL_EVENT__SHOT, this.render.bind(this));
		this.model.computerPlayer.on(MODEL_EVENT__SHOT, this.render.bind(this));
	}

	render () {
		let humanPlayer = this.model.humanPlayer;
		let computerPlayer = this.model.computerPlayer;

		let output = `
			${this.renderPlayerHud(humanPlayer)}
			${this.renderPlayerHud(computerPlayer)}
		`;

		this.rootElement.innerHTML = output;
	}

	renderPlayerHud (player) {
		let opponent = this.getOpponent(player);
		return `${player.name}: ${opponent.getNumHits()}`;
	}

	getOpponent (player) {
		return player === this.model.humanPlayer ? this.model.computerPlayer : this.model.humanPlayer;
	}

}
