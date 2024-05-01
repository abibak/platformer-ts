import Player from "../objects/Player";
import World from '../objects/World';
import EventBus from "../EventBus";
import Canvas from "../objects/Canvas";
import KeyboardController from "../controllers/KeyboardController";
import MouseController from "../controllers/MouseController";
import Camera from "../objects/Camera";
import Enemy from "@/objects/Enemy";
import Collider from "@/objects/Collider";

export default class Game {
    private readonly _bus: EventBus;
    private readonly _players: Player[] = [];
    private _player: Player;
    private readonly _world: World;
    private readonly _canvas: Canvas;
    private _camera: Camera;
    private _collider: Collider;
    private _controller: KeyboardController;
    private _mouseController: MouseController;
    private _frame;
    private _mapLayers = null;
    private _entities: (Player | Enemy)[] = [];

    constructor(bus: EventBus, controller: KeyboardController, mouseController: MouseController) {
        this._bus = bus;
        this._canvas = new Canvas;
        this._collider = new Collider;
        this._controller = controller;
        this._mouseController = mouseController;
        this.createPlayer();

        this._bus.subscribe('map:generate', this.mapCollisionLayers.bind(this));
        this._bus.subscribe('toggleClickState', this._mouseController.toggleStateClick.bind(this._mouseController));
        this._bus.subscribe('setEnemies', (data) => {
            this._entities.push(...data);
        });

        this._camera = new Camera(this._player, this._canvas);
        this._world = new World(this._canvas, this._bus);

        requestAnimationFrame(this.update.bind(this));
    }

    public createPlayer(): void {
        this._player = new Player(this._bus, this._canvas, 0, 512, 35, 82);
        this._entities.push(this._player);
    }

    // Основной update метод
    private async update(timestamp) {
        this._canvas.clearCanvas();

        this._camera.update();
        await this.render(timestamp);

        this._entities.forEach((entity) => {
            entity.onGround = false;
        });

        this._entities.forEach((entity: Player | Enemy): void => {
            this._mapLayers.forEach((layer) => {
                this._collider.checkCollisionObjects(entity, layer);
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
    private async render(timestamp) {
        await this._world.processMap();

        await this._entities.forEach((entity: Player | Enemy): void => {
            entity.update(timestamp);
        });

        // for (const player: Player of this._players) {
        //     await player.update(timestamp);
        // }
    }

    public handleCharacterActionMouse(): void {
        this._player.isAttack = this._mouseController.click;
    }

    // Логика передвижения персонажа и действий
    public handleCharacterMovement(): void {
        if (this._controller.jump) {
            this._player.jump();
            this._player.isJump = true;
            this._controller.jump = false;
            this._player.onGround = false;
        }

        // if (this._controller.down) {
        //     this._player.y += 5;
        // }

        if (this._controller.left) {
            this._player.x -= this._player.speed;
            this._player.isMovingLeft = true;
            this._player.isFacingLeft = true;
        } else {
            this._player.isMovingLeft = false;
        }

        if (this._controller.right) {
            this._player.x += this._player.speed;
            this._player.isMovingRight = true;
            this._player.isFacingLeft = false;
        } else {
            this._player.isMovingRight = false;
        }
    }

    // Установка объектов коллизии
    public mapCollisionLayers(data: any) {
        this._mapLayers = data;
    }

    // Коллайдер, перенести логику в отдельный класс "Collider.ts"

}
