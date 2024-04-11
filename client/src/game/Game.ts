import Player from "../objects/Player";
import World from '../objects/World';
import EventBus from "../EventBus";
import Canvas from "../objects/Canvas";
import KeyboardController from "../controllers/KeyboardController";
import MouseController from "../controllers/MouseController";
import Camera from "../objects/Camera";

export default class Game {
    private readonly _bus: EventBus;
    private _player: Player;
    private _world: World;
    private _canvas: Canvas;
    private _camera: Camera;
    private _controller: KeyboardController;
    private _mouseController: MouseController;
    private _frame;
    private _mapLayers = null;
    private _objects = [];
    private _collisionSide: string = '';

    // *** Перенести свойства в класс Player
    public speed = 0.25;
    public maxSpeed = 3;
    public multiplier = 0.085;
    public result = 0;

    // ***

    constructor(bus: EventBus, controller: KeyboardController, mouseController: MouseController) {
        this._bus = bus;
        this._canvas = new Canvas();
        this._controller = controller;
        this._mouseController = mouseController;
        this._player = new Player(this._bus, this._canvas, 500, 512, 35, 82);
        this._world = new World(this._canvas, this._bus);
        this._camera = new Camera(this._player, this._canvas, this._bus);

        this._bus.subscribe('map:generate', this.mapCollisionLayers.bind(this));
        this._bus.subscribe('map:changeObjectsPositions', this.processPositionsObjects.bind(this));

        requestAnimationFrame(this.update.bind(this));
    }

    // Основной update метод
    private async update(timestamp) {
        this._canvas.clearCanvas();

        this._camera.update();
        await this.render(timestamp);

        this._collisionSide = ''; // обнуление состояния коллизии

        for (const obj of this._objects) {
            this.collider(obj);
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
    }

    public handleCharacterActionMouse(): void {
        this._player.isAttack = this._mouseController.click;
    }

    // Логика передвижения персонажа и активных действий
    public handleCharacterMovement(): void {
        if (this._controller.left || this._controller.right) {
            if (this.speed < this.maxSpeed) {
                this.result = (this.multiplier / this.speed);
                this.speed += Math.pow(this.result, 1);
            }
        }

        if (this._controller.jump) {
            this._player.jump();
            this._controller.jump = false;
            this._player.onGround = false;
        }

        if (this._controller.left) {
            this._player.x -= this.speed;
            this._player.isMovingLeft = true;
            this._player.isFacingLeft = true;
            this._camera.offsetX += 0.5;
        } else {
            this._player.isMovingLeft = false;
        }

        if (this._controller.right) {
            this._player.x += this.speed;
            this._player.isMovingRight = true;
            this._player.isFacingLeft = false;
            this._camera.offsetX -= 0.5;
        } else {
            this._player.isMovingRight = false;
        }

        if (this._controller.down) {
            this._player.y += 3;
        }
    }

    private processPositionsObjects(data: { xOffset: number, yOffset: number }) {
        if (this._mapLayers !== null) {
            // this._mapLayers = this._mapLayers.map((el): {} => {
            //     el.x -= data.xOffset;
            //     return el;
            // });

            this._objects = this._mapLayers;
        }
    }

    // Установка слоев коллизии
    public mapCollisionLayers(data: any) {
        this._mapLayers = data;
    }

    // Коллайдер, перенести логику в отдельный класс "Collider"
    private collider(collisionObject: any) {
        let dY = (this._player.y + (this._player.height / 2)) - (collisionObject.y + (collisionObject.h / 2));
        let dX = (this._player.x + (this._player.width / 2)) - (collisionObject.x + (collisionObject.w / 2));

        let width = ((this._player.width / 2) + (collisionObject.w / 2));
        let height = ((this._player.height / 2) + (collisionObject.h / 2));

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
