import Model from 'src/lib/Model';
import Player from 'src/models/Player';

/**
 * @class Game
 */
export default class Game extends Model {

	constructor (
		humanPlayer = new Player('Human'),
		computerPlayer = new Player('Computer')
	) {
		super();

		this.humanPlayer = humanPlayer;
		this.computerPlayer = computerPlayer;
	}

}
