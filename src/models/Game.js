import Model from 'src/lib/Model';
import Player from 'src/models/Player';


/**
 * @class Game
 */
export default class Game extends Model {

	constructor (attributes) {
		super(Object.assign({
			humanPlayer: new Player({ name: 'Neo' }),
			computerPlayer: new Player({ name: 'Agent Smith' })
		}, attributes));
	}

}
