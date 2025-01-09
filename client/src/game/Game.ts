import Player from "../objects/characters/Player";
import World from '../objects/world/World';
import EventBus from "../EventBus";
import Canvas from "../objects/Canvas";
import KeyboardController from "../controllers/KeyboardController";
import MouseController from "../controllers/MouseController";
import Camera from "../objects/Camera";
import Collision from "@/objects/Collision";
import CollisionHandler from "@/handlers/CollisionHandler";
import Character from "@/objects/characters/Character";
import playerConfig from "@/assets/data/player.json";
import GameObject from "@/objects/world/GameObject";
import {filterAliveEntities} from "@/utils/utils";
import GameObjectsStore from "@/state/GameObjectsStore";
import Library from "@/library/Library";
import App from "@/App";
import GameScreen from "@/objects/screens/GameScreen";

export default class Game {
    private readonly _app: App;
    private readonly _canvas: Canvas;
    private readonly _bus: EventBus;
    private readonly _library: Library;
    private _gameObjectsStore: GameObjectsStore;
    private _player: Player;
    private _world: World;
    private _camera: Camera;
    private _collision: Collision;
    private _controller: KeyboardController;
    private _mouseController: MouseController;
    private _gameObjects: GameObject[] = [];
    private _gameState: string = 'pause';

    private _frame;
    private _lastTime: number = 0;
    private tickRate: number = 1000 / 60;

    public constructor(
        app: App,
        bus: EventBus,
        controller: KeyboardController,
        mouseController: MouseController
    ) {
        this._app = app;
        this._library = Library.getInstance();
        this._gameObjectsStore = new GameObjectsStore;
        this._bus = bus;
        this._canvas = Canvas.getInstance();
        this._collision = new Collision;
        this._controller = controller;
        this._mouseController = mouseController;

        //this.init();

        this.subscribeEvents();

        requestAnimationFrame(this.update.bind(this));

        //this._library.sounds().lightAmbient2.play();
    }

    private subscribeEvents(): void {
        this._bus.subscribe('game:init', this.init.bind(this));
        this._bus.subscribe('toggleClickState', this._mouseController.toggleStateClick.bind(this._mouseController));
        this._bus.subscribe('game:filterEntities', () => this._gameObjects = filterAliveEntities(this._gameObjects));
        // стоит вынести addGameEntity непосредственно в GameObject, чтобы при создании экземпляра вызывать метод в Game
        this._bus.subscribe('game:addGameEntity', (obj: GameObject) => this.addGameEntity(obj));
    }

    private async init(): Promise<void> {
        try {
            this._gameState = '';
            await this.createPlayer();
            this._camera = new Camera(this._player, this._canvas);
            this._world = new World(5, 3, this._library, this._canvas, this._bus, this._player);
            this._app.setScreen(new GameScreen);
        } catch (error) {
            console.log('Ошибка инициализации.', error);
        }
    }

    private async createPlayer(): Promise<void> {
        try {
            const player: Player = new Player(playerConfig, this._gameObjects);
            this._player = this._gameObjectsStore.add(player);
            this._player.mode = 'default';
            this._gameObjects.push(this._player);
        } catch (e) {
            throw e;
        }
    }

    private addGameEntity(obj: GameObject): void {
        this._gameObjects.push(obj);
    }

    // изменить локигу фильтрации коллизий
    // проверять коллизию только в текущем чанке
    private handleCollision(): void {
        let filterArrGameObjects: GameObject[] = [];

        // возможно добавить свойство filterGameObjects и изменять в случае вызова игрового события изменения состояния мира
        // то есть при любом изменении вызвать filterGameObjects и обновить данные в массиве
        // но, GameObject объекты могут изменять свое положение в процессе игры и это будет поводом для вызова "события",
        // поэтому вероятность вызова 99.9%
        // в таком случае нужно составить массив с измененными объектами, которые вызвали событие и работать непосредственно с ними
        // на данный момент массив постоянно пересобирается заново, даже если состояния не изменяются, либо же кешировать
        // засталяет задуматься, но все ради оптимизации, я так думаю :-)
        this._gameObjects.forEach((entity: GameObject): void => {
            if (entity instanceof Character) {
                const {x: entityX, y: entityY, id: entityId, type: entityType} = entity;

                // фильтрация массива в диапазоне 128px по x, y
                filterArrGameObjects = this._gameObjects.filter((obj: GameObject) => {
                    const {x: objX, y: objY, id: objId} = obj;
                    let objType: string = '';

                    // установить тип, если объект является Character
                    if (obj instanceof Character) {
                        objType = obj.type;
                    }

                    // расстояние между объектами
                    const dx: number = Math.abs(entityX - objX);
                    const dy: number = Math.abs(entityY - objY);

                    if (entityId !== objId && entityType !== objType && dx <= 128 && dy <= 128) {
                        return true;
                    }
                });

                // обработка коллизии
                filterArrGameObjects.forEach((obj: GameObject): void => {
                    if (!obj.collidable) {
                        return;
                    }

                    this._canvas.drawNearbyTiles(obj);

                    const collisionInfo = this._collision.detectCollision(this._player, obj);

                    if (collisionInfo) {
                        this._collision.resolveCollision(this._player, obj, collisionInfo);
                    }
                });
            }
        });
    }

    private async update(timestamp: number): Promise<void> {
        if (!this._lastTime) {
            this._lastTime = timestamp;
        }

        const dt: number = (timestamp - this._lastTime) / 1000;

        this._lastTime = timestamp;

        this._canvas.clearCanvas();

        if (this._gameState !== 'pause') {
            await this._camera.update();
            await this.render(timestamp);

            for (const obj of this._gameObjects) {
                if (obj instanceof Character) {
                    await obj.update(timestamp, dt);
                }
            }

            await this.handleCollision();
            await this.handleCharacterMovement();

            if (this._library.sounds().lightAmbient2.ended) {
                this._library.sounds().lightAmbient2.replay();
            }
        }

        await this._app.update();

        this._frame = window.requestAnimationFrame(this.update.bind(this));
    }

    private async render(timestamp: number): Promise<void> {
        await this._world.update(timestamp);
        await this._canvas.drawHealthPlayer(this._player.health, this._player.maxHealth);
    }

    public defaultPlayerMovement(): void {
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

    public debugPlayerMovement(): void {
        const speed = 15;

        if (this._controller.top) {
            this._player.y -= speed;
        }

        if (this._controller.down) {
            this._player.y += speed;
        }

        if (this._controller.left) {
            this._player.x -= speed;
        }

        if (this._controller.right) {
            this._player.x += speed;
        }
    }

    public handleCharacterMovement(): void {
        if (this._player.mode === 'default') {
            this.defaultPlayerMovement()
        } else {
            this.debugPlayerMovement();
        }
    }
}