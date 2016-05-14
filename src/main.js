import Game from './models/Game';
import GameView from './views/GameView';
import GameController from './controllers/GameController';

import './main.scss';


const gameModel = new Game();
const gameView = new GameView(gameModel);
const gameController = new GameController(gameModel, gameView);

window.console.log(gameController);
