import Model from 'src/lib/Model';
import Player from 'src/models/Player';
import { DEFAULT_BOARD_SIZE } from 'src/models/Board';


/**
 * @class Game
 */
export default class Game extends Model {

	constructor (attributes) {
		super(Object.assign({
			humanPlayer: new Player({ name: 'Neo' }),
			computerPlayer: new Player({ name: 'Agent Smith' }),
			boardSize: DEFAULT_BOARD_SIZE
		}, attributes));
	}

}
