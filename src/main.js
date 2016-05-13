import Game from './models/Game';
import GameDebugView from './views/GameDebugView';
import GameController from './controllers/GameController';

import './main.scss';


const gameModel = new Game();
const gameView = new GameDebugView(gameModel);
const gameController = new GameController(gameModel, gameView);

window.console.log(gameController);
