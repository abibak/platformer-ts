import EventBus from "./EventBus";
import Socket from './Socket';
import Game from "./game/Game";
import KeyboardController from "./controllers/KeyboardController";
import MouseController from "./controllers/MouseController";

export default class App {
    private _game: Game;
    private _bus: EventBus;
    private _socket: Socket;
    private _keyboardController: KeyboardController;
    private _mouseController: MouseController;

    constructor() {
        this.init();
    }

    private init() {
        this._keyboardController = new KeyboardController;
        this._mouseController = new MouseController;
        this._socket = new Socket('ws://localhost:8080');
        this._bus = new EventBus;
        this._game = new Game(this._bus, this._keyboardController, this._mouseController);
        this.subscribeEvents();
    }

    private subscribeEvents() {
        document.addEventListener('mousedown', this.handleInputMouse.bind(this));
        document.addEventListener('mouseup', this.handleInputMouse.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        document.addEventListener('keyup', this.handleKeyboard.bind(this));

        this._bus.subscribe('app:start', this.start);
        this._bus.subscribe('app:end', this.end);
    }

    private handleInputMouse(event): void {
        if (event.type === 'mousedown' && event.which === 1) {
            this._mouseController.handleMouseEventDown(event);
        }

        if (event.type === 'mouseup' && event.which === 1) {
            this._mouseController.handleMouseEventUp(event);
        }
    }

    private handleKeyboard(event): void {
        if (event.type === 'keydown') {
            this._keyboardController.onKeyDown(event.keyCode);
        }

        if (event.type === 'keyup') {
            this._keyboardController.onKeyUp(event.keyCode);
        }
    }

    public start() {
        console.log('START GAME');
    }

    public end() {
        console.log('END GAME!');
    }
}