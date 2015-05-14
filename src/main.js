import 'babelify/polyfill';

import Game from './models/Game';
import GameView from './views/GameView';
import GameController from './controllers/GameController';

let gameModel = new Game();
let gameView = new GameView(gameModel);
let gameController = new GameController(gameModel, gameView);

gameView.render();

window.gameModel = gameModel;
window.gameView = gameView;
window.gameController = gameController;
