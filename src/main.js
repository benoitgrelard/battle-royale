import 'babelify/polyfill';

import Game from './models/Game';
// import GameDebugView from './views/GameDebugView';
import Game3dView from './views/Game3dView';
import GameController from './controllers/GameController';
import { $ } from './lib/helpers';

let gameModel = new Game();
// let gameDebugView = new GameDebugView(gameModel, $('#view2d')[0]);
let game3dView = new Game3dView(gameModel, $('#view3d')[0]);
// let gameController1 = new GameController(gameModel, gameDebugView);
let gameController2 = new GameController(gameModel, game3dView);

window.gameModel = gameModel;
// window.gameDebugView = gameDebugView;
window.game3dView = game3dView;
// window.gameController1 = gameController1;
window.gameController2 = gameController2;
