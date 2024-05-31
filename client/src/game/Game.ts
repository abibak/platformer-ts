import Player from "../objects/Player";
import World from '../objects/World';
import EventBus from "../EventBus";
import Canvas from "../objects/Canvas";
import KeyboardController from "../controllers/KeyboardController";
import MouseController from "../controllers/MouseController";
import Camera from "../objects/Camera";
import Enemy from "@/objects/Enemy";
import Collider from "@/objects/Collider";
import UI from "@/ui/UI";
import Library from "@/library/Library";
import Collision from "@/objects/Collision";
import {Tile} from "@/types/main";

export default class Game {
    private readonly _canvas: Canvas;
    private readonly _bus: EventBus;
    private readonly _players: Player[] = [];
    private readonly _library: Library;
    private _ui: UI;
    private _player: Player;
    private _world: World;
    private _camera: Camera;
    private _collider: Collider;
    private _controller: KeyboardController;
    private _mouseController: MouseController;
    private _frame;
    private _mapObjects = null;
    private _entities: (Player | Enemy)[] = [];
    private _gameState: string = '';

    public constructor(
        library: Library,
        bus: EventBus,
        ui: UI,
        canvas: Canvas,
        controller: KeyboardController,
        mouseController: MouseController
    ) {
        this._library = library;
        this._ui = ui;
        this._bus = bus;
        this._canvas = canvas;
        this._collider = new Collider;
        this._controller = controller;
        this._mouseController = mouseController;

        //this._library.sounds('world').light_ambient2.play();

        this.subscribeEvents();
    }

    private subscribeEvents(): void {
        this._bus.subscribe('game:createPlayer', (id: number): void => {
            this.createPlayer(id);
            this._camera = new Camera(this._player, this._canvas);
            this._world = new World(this._library, this._canvas, this._bus, this._player);

            requestAnimationFrame(this.update.bind(this));
        });

        this._bus.subscribe('world:generated', (data: []) => {
            this._mapObjects = data;
        });

        this._bus.subscribe('toggleClickState', this._mouseController.toggleStateClick.bind(this._mouseController));
    }

    private createPlayer(id: number): void {
        this._player = new Player(this._library, this._bus, this._canvas, id, 0, 512, 35, 82);
        this._entities.push(this._player);
    }

    // Основной update метод
    private async update(timestamp): Promise<void> {
        this._canvas.clearCanvas();

        this._camera.update();
        await this.render(timestamp);

        if (this._library.sounds('world').light_ambient2.ended) {
            this._library.sounds('world').light_ambient2.replay();
        }

        this._entities.forEach((entity: Player | Enemy): void => {
            entity.onGround = false;
        });

        this._entities.forEach((entity: Player | Enemy): void => {
            // фильтрация массива коллайдеров в диапазоне 128px по x, y
            const collideObjects = this._mapObjects.filter(obj => {
                const dx: number = Math.abs(entity.x - obj.x),
                    dy: number = Math.abs(entity.y - obj.y);

                return dx <= 128 && dy <= 128;
            });

            collideObjects.forEach((layer): void => {
                if (this._collider.checkColliding(entity, layer)) {
                    Collision.handle(layer);
                }
            });
        });

        this.handleCharacterActionMouse();
        this.handleCharacterMovement();

        this._frame = window.requestAnimationFrame(this.update.bind(this));
    }

    /*
    * Отрисовка карты
    * Обновление состояние игрока
    * */
    private async render(timestamp): Promise<void> {
        await this._world.update();

        await this._entities.forEach((entity: Player | Enemy): void => {
            entity.update(timestamp);
        });

        await this._canvas.drawHealthPlayer(this._player.health, this._player.maxHealth);
    }

    public handleCharacterActionMouse(): void {
        this._player.isAttack = this._mouseController.click;
    }

    public handleCharacterMovement(): void {
        if (this._controller.jump) {
            this._player.jump();
            this._player.isJump = true;
            this._controller.jump = false;
            this._player.onGround = false;
        }

        if (this._controller.left) {
            this._player.startMovingLeft();
        } else {
            this._player.stopMovingLeft();
        }

        if (this._controller.right) {
            this._player.startMovingRight();
        } else {
            this._player.stopMovingRight();
        }
    }
}
