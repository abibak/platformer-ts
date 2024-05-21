import EventBus from "./EventBus";
import Socket from './Socket';
import Game from "./game/Game";
import KeyboardController from "./controllers/KeyboardController";
import MouseController from "./controllers/MouseController";
import UI from "@/ui/UI";
import Canvas from "@/objects/Canvas";

export default class App {
    private _bus: EventBus;
    private readonly _canvas: Canvas;
    private _ui: UI;
    private _game: Game;
    private _socket: Socket;
    private _keyboardController: KeyboardController;
    private _mouseController: MouseController;

    public constructor() {
        this._bus = new EventBus;
        this._canvas = new Canvas;
        this._socket = new Socket(this._bus);
        this._keyboardController = new KeyboardController;
        this._mouseController = new MouseController;

        this._bus.subscribe('app:start', this.start.bind(this));
        this._bus.subscribe('app:end', this.end.bind(this));

        // this._socket.connection(process.env.WSS_URL).then(() => {
        //     this.subscribeEvents();
        // }).catch(error => {
        //     console.error('Error:', error);
        // });

        //this._ui = new UI(this._bus, this._canvas);
        this.init();
    }

    private init() {
        this._game = new Game(this._bus, this._ui, this._canvas, this._keyboardController, this._mouseController);
        this._bus.publish('game:createPlayer', 1);
        this.subscribeEvents();
    }

    private subscribeEvents() {
        this._bus.subscribe('socket:connected', (data) => {

        });

        document.addEventListener('mousedown', this.handleInputMouse.bind(this));
        document.addEventListener('mouseup', this.handleInputMouse.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        document.addEventListener('keyup', this.handleKeyboard.bind(this));
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

    public start(): void {
        console.log('START GAME');
        this.init();
    }

    public end(): void {
        console.log('END GAME!');
    }
}