import 'babelify/polyfill';

import Game from './models/Game';
import GameView from './views/GameView';
import HudView from './views/HudView';
import GameController from './controllers/GameController';
import { $ } from './lib/helpers';

let gameModel = new Game();

let gameViewElement = $('.GameView')[0];
let gameView = new GameView(gameModel, gameViewElement);

let hudViewElement = $('.HudView')[0];
let hudView = new HudView(gameModel, hudViewElement);

let gameController = new GameController(gameModel, gameView);

console.log(gameController, hudView);
