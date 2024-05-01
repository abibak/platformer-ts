import EventBus from "./EventBus";
import Socket from './Socket';
import Game from "./game/Game";
import KeyboardController from "./controllers/KeyboardController";
import MouseController from "./controllers/MouseController";
import UI from "@/ui/UI";
import * as process from "process";

export default class App {
    private _ui: UI;
    private _game: Game;
    private _bus: EventBus;
    private _socket: Socket;
    private _keyboardController: KeyboardController;
    private _mouseController: MouseController;

    constructor() {
        this._bus = new EventBus;
        this._socket = new Socket(this._bus);
        //this._ui = new UI(this._bus);

        this._socket.connection(process.env.WSS_URL).then(() => {
            this.init(); // временно
            //this._ui.init();
            this._bus.subscribe('app:start', this.start.bind(this));
        }).catch(error => {
            console.error('Error:', error);
        });
    }

    private init() {
        this._keyboardController = new KeyboardController;
        this._mouseController = new MouseController;
        this._game = new Game(this._bus, this._keyboardController, this._mouseController);

        this.subscribeEvents();
    }

    private subscribeEvents() {
        document.addEventListener('mousedown', this.handleInputMouse.bind(this));
        document.addEventListener('mouseup', this.handleInputMouse.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        document.addEventListener('keyup', this.handleKeyboard.bind(this));

        this._bus.subscribe('app:end', this.end);
    }

    private handleInputMouse(event): void {
        if (event.type === 'mousedown' && event.which === 1) {
            this._mouseController.handleMouseEventDown(event);
        }

        // if (event.type === 'mouseup' && event.which === 1) {
        //     this._mouseController.handleMouseEventUp(event);
        // }
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
        this.init();
    }

    public end() {
        console.log('END GAME!');
    }
}