import Model from '../lib/Model';
import Player from './Player';
import { DEFAULT_BOARD_SIZE } from './Board';



/**
 * @class Game
 */
export default class Game extends Model {

	constructor (attributes) {
		super(Object.assign({
			humanPlayer: new Player({
				name: 'Neo',
				type: 'human'
			}),
			computerPlayer: new Player({
				name: 'Agent Smith',
				type: 'computer'
			}),
			boardSize: DEFAULT_BOARD_SIZE
		}, attributes));
	}

}
