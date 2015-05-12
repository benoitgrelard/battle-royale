import Game from 'src/models/Game';
import GameView from 'src/views/GameView';
import GameController from 'src/controllers/GameController';

let gameModel = new Game();
let gameView = new GameView(gameModel);
let gameController = new GameController(gameModel, gameView);

gameView.render();

window.gameModel = gameModel;
window.gameView = gameView;
window.gameController = gameController;
