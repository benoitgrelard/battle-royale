import 'babelify/polyfill';

import Game from './models/Game';
import Game3dView from './views/Game3dView';
import GameController from './controllers/GameController';

let gameModel = new Game();
let gameView = new Game3dView(gameModel);
let gameController = new GameController(gameModel, gameView);

window.gameModel = gameModel;
window.gameView = gameView;
window.gameController = gameController;
