import Model from 'src/lib/Model';
import { getRandomInt } from 'src/lib/helpers';


/**
 * @class Coordinate
 */
export default class Coordinate extends Model {

	constructor (attributes) {
		super(Object.assign({
			x: 0,
			y: 0
		}, attributes));
	}

	toCode () {
		return String.fromCharCode(65 + this.x) + (this.y + 1);
	}

	static fromCode (code) {
		let x = code.charCodeAt(0) - 65;
		let y = Number(code[1]) - 1;

		return new Coordinate({ x, y });
	}

	static random (size) {
		let x = getRandomInt(0, size - 1);
		let y = getRandomInt(0, size - 1);

		return new Coordinate({ x, y });
	}

}
