import Model from 'src/lib/Model';
import Player from 'src/models/Player';

/**
 * @class Game
 */
export default class Game extends Model {

	constructor (
		humanPlayer = new Player('Neo'),
		computerPlayer = new Player('Agent Smith')
	) {
		super();

		this.humanPlayer = humanPlayer;
		this.computerPlayer = computerPlayer;
	}

}
