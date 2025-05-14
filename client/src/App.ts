import EventBus from "./EventBus";
import Socket from './Socket';
import Game from "./game/Game";
import KeyboardController from "./controllers/KeyboardController";
import MouseController from "./controllers/MouseController";
import Library from "@/library/Library";
import Screen from "@/objects/screens/Screen";
import MenuScreen from "@/objects/screens/MenuScreen";
import Canvas from "@/objects/Canvas";
import { log } from "node:console";
import GameScreen from "./objects/screens/GameScreen";

export default class App {
    private readonly _canvas: Canvas;
    private _bus: EventBus;
    private _game: Game;
    private _screen: Screen;
    private _socket: Socket;
    private _keyboardController: KeyboardController;
    private _mouseController: MouseController;
    private _library: Library;

    public constructor() {
        this._canvas = Canvas.getInstance();
        this._bus = EventBus.getInstance();
        this._screen = new MenuScreen();
        this._library = Library.getInstance();
        this._socket = new Socket(this._bus);
        this._keyboardController = new KeyboardController;
        this._mouseController = new MouseController();

        this.loadComponents();
    }

    private loadComponents() {
        try {
            this._bus.subscribe('library:loaded', () => {
                console.log('library loaded');
                this.init();
            });
        } catch (e) {
            console.log('Ошибка инициализации игры', e)
        }
    }

    private init() {
        try {
            this._game = new Game(
                this,
                this._bus,
                this._keyboardController,
                this._mouseController
            );

            this._game.init();
            this.subscribeEvents();
        } catch (e) {
            throw e;
        }
    }

    public async update() {
        this._screen.update();

        if (this._keyboardController.esc) {
            this._game.gameState = 'pause';
        }
    }

    public setScreen(screen: Screen) {
        this._screen = screen;
    }

    private subscribeEvents(): void {
        document.addEventListener('mousedown', this.handleInputMouse.bind(this));
        document.addEventListener('mouseup', this.handleInputMouse.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        document.addEventListener('keyup', this.handleKeyboard.bind(this));
        this._bus.subscribe('keyboard:pressEsc', value => this.handleVisibleScreen(value));
    }

    private handleVisibleScreen(visible: boolean) {
        if (this._screen instanceof GameScreen) {
            this._game.gameState = visible ? 'pause' : 'started';
        }
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