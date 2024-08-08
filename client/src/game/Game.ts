import Player from "../objects/Player";
import World from '../objects/World';
import EventBus from "../EventBus";
import Canvas from "../objects/Canvas";
import KeyboardController from "../controllers/KeyboardController";
import MouseController from "../controllers/MouseController";
import Camera from "../objects/Camera";
import Collider from "@/objects/Collider";
import UI from "@/ui/UI";
import Library from "@/library/Library";
import CollisionHandler from "@/handlers/CollisionHandler";
import Character from "@/objects/Character";
import playerConfig from "@/assets/data/player.json";
import {GameObject} from "@/types/game";
import Tile from "@/objects/Tile";
import {filterAliveEntities} from "@/utils/utils";

export default class Game {
    private readonly _canvas: Canvas;
    private readonly _bus: EventBus;
    private readonly _library: Library;
    private _ui: UI;
    private _player: Character;
    private _world: World;
    private _camera: Camera;
    private _collider: Collider;
    private _controller: KeyboardController;
    private _mouseController: MouseController;
    private _frame;
    private _gameEntities: GameObject[] = [];
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

        this.createPlayer().then((player: Player): void => {
            this._player = player;
            this.subscribeEvents();
            requestAnimationFrame(this.update.bind(this));
        });

        this._library.sounds().lightAmbient2.play();
    }

    private subscribeEvents(): void {
        this._camera = new Camera(this._player, this._canvas);
        this._world = new World(this._library, this._canvas, this._bus, this._player);

        this._bus.subscribe('player:attack', (): void => {
            this._player.attack(this._gameEntities);
        });
        this._bus.subscribe('toggleClickState', this._mouseController.toggleStateClick.bind(this._mouseController));
        this._bus.subscribe('game:filterEntities', () => this._gameEntities = filterAliveEntities(this._gameEntities))
        this._bus.subscribe('game:addGameEntity', (obj: GameObject) => this.addGameEntity(obj));
    }

    private createPlayer(): Promise<Player> {
        return new Promise((resolve): void => {
            const player: Player = new Player(
                this._library, this._bus, this._canvas, playerConfig, this._gameEntities
            );

            this._gameEntities.push(player);
            resolve(player)
        });
    }

    private addGameEntity(obj: GameObject): void {
        this._gameEntities.push(obj);
    }

    private handleCollision(): void {
        let collisionObjects: GameObject[] = [];

        this._gameEntities.forEach((entity: GameObject): void => {
            if (entity instanceof Character) {
                const {x: entityX, y: entityY, id: entityId, type: entityType} = entity;

                // фильтрация массива в диапазоне 128px по x, y
                collisionObjects = this._gameEntities.filter((obj: GameObject) => {
                    const {x: objX, y: objY, id: objId} = obj;
                    let objType: string = '';

                    // установить тип, если объект является Character
                    if (obj instanceof Character) {
                        objType = obj.type;
                    }

                    // расстояние между персонажем и объектом коллизии
                    const dx: number = Math.abs(entityX - objX);
                    const dy: number = Math.abs(entityY - objY);

                    return entityId !== objId && entityType !== objType && dx <= 128 && dy <= 128;
                });

                // обработка коллизии
                collisionObjects.forEach((obj: GameObject): void => {
                    // получить сторону коллизии или же false
                    let side: string | boolean = this._collider.checkColliding(entity, obj);

                    if (side) {
                        CollisionHandler.handle(entity, obj, side as string);
                    }

                    if (!side) {
                        CollisionHandler.handle(entity, null, side as boolean)
                    }
                });
            }
        });
    }

    private async update(timestamp): Promise<void> {
        this._canvas.clearCanvas();

        await this._camera.update();
        await this.render(timestamp);

        if (this._library.sounds().lightAmbient2.ended) {
            this._library.sounds().lightAmbient2.replay();
        }

        this._gameEntities.forEach((entity: GameObject): void => {
            if (entity instanceof Character) {
                entity.update(timestamp);
                entity.onGround = false;
            }
        });

        await this.handleCollision();
        await this.handleCharacterActionMouse();
        await this.handleCharacterMovement();
        this._frame = window.requestAnimationFrame(this.update.bind(this));
    }

    private async render(timestamp: number): Promise<void> {
        await this._world.update(timestamp);
        await this._canvas.drawHealthPlayer(this._player.health, this._player.maxHealth);
    }

    public handleCharacterActionMouse(): void {

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
