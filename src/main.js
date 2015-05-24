import 'babelify/polyfill';

import Game from './models/Game';
// import GameView from './views/GameView';
import Game3dView from './views/Game3dView';
import GameController from './controllers/GameController';
import { $ } from './lib/helpers';

let gameModel = new Game();
// let game2dView = new GameView(gameModel, $('#view2d')[0]);
let game3dView = new Game3dView(gameModel, $('#view3d')[0]);
// let gameController1 = new GameController(gameModel, game2dView);
let gameController2 = new GameController(gameModel, game3dView);

window.gameModel = gameModel;
// window.game2dView = game2dView;
window.game3dView = game3dView;
// window.gameController1 = gameController1;
window.gameController2 = gameController2;
