import Player from "../objects/Player";
import World from '../objects/World';
import EventBus from "../EventBus";
import Canvas from "../objects/Canvas";
import KeyboardController from "../controllers/KeyboardController";
import MouseController from "../controllers/MouseController";
import Camera from "../objects/Camera";

export default class Game {
    private readonly _bus: EventBus;
    private readonly _players: Player[] = [];
    private readonly _player: Player;
    private readonly _world: World;
    private readonly _canvas: Canvas;
    private _camera: Camera;
    private _controller: KeyboardController;
    private _mouseController: MouseController;
    private _frame;
    private _mapLayers = null;
    private _collisionSide: string = '';

    constructor(bus: EventBus, controller: KeyboardController, mouseController: MouseController) {
        this._bus = bus;
        this._canvas = new Canvas;
        this._controller = controller;
        this._mouseController = mouseController;

        this._player = new Player(this._bus, this._canvas, 400, 512, 35, 82);

        this._players.push(new Player(this._bus, this._canvas, 100, 512, 35, 82));
        this._players.push(this._player);

        this._world = new World(this._canvas, this._bus);
        this._camera = new Camera(this._player, this._canvas, this._bus);

        this._bus.subscribe('map:generate', this.mapCollisionLayers.bind(this));
        this._bus.subscribe('toggleStateClick', this._mouseController.toggleStateClick.bind(this._mouseController));

        requestAnimationFrame(this.update.bind(this));
    }

    // Основной update метод
    private async update(timestamp) {
        this._canvas.clearCanvas();

        this._camera.update();
        await this.render(timestamp);

        this._collisionSide = ''; // обнуление состояния коллизии

        for (const obj of this._mapLayers) {
            this.collider(this._player, obj);
        }

        if (this._collisionSide !== 'bottom') {
            this._player.onGround = false;
        }

        this.handleCharacterActionMouse();
        this.handleCharacterMovement();
        this._frame = window.requestAnimationFrame(this.update.bind(this));
    }

    /*
    * Отрисовка карты
    * Обновление состояние игрока
    * */
    private async render(timestamp) {
        await this._world.generateMap();
        await this._player.update(timestamp);

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

    // Коллайдер, перенести логику в отдельный класс "Collider"
    private collider(player: Player, collisionObject: any) {
        let dY = (player.y + (player.height / 2)) - (collisionObject.y + (collisionObject.h / 2));
        let dX = (player.x + (player.width / 2)) - (collisionObject.x + (collisionObject.w / 2));

        let width = ((player.width / 2) + (collisionObject.w / 2));
        let height = ((player.height / 2) + (collisionObject.h / 2));

        // detection collision all side
        if (Math.abs(dY) <= height && Math.abs(dX) <= width) {
            if (Math.abs(dY) > Math.abs(dX)) {
                if (dY > 0) {
                    this._player.y += height - Math.abs(dY); // top side
                    this._collisionSide = 'top';
                }

                if (dY < 0) {
                    this._player.y -= height - Math.abs(dY); // bottom side
                    this._collisionSide = 'bottom';
                    this._player.onGround = true;
                }
            }

            if (Math.abs(dX) > Math.abs(dY)) {
                if (dX <= 0) {
                    this._player.x -= width - Math.abs(dX); // right side
                    this._collisionSide = 'right';
                } else if (dX <= width) {
                    this._player.x += width - Math.abs(dX); // left side
                    this._collisionSide = 'left';
                }
            }
        }
    }
}
