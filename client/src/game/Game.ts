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
import CollisionHandler from "@/handlers/CollisionHandler";
import Character from "@/objects/Character";
import {Tile} from "@/types/main";
import playerConfig from "@/assets/data/player.json";

export default class Game {
    private readonly _canvas: Canvas;
    private readonly _bus: EventBus;
    private readonly _library: Library;
    private _ui: UI;
    private _player: Player;
    private _world: World;
    private _camera: Camera;
    private _collider: Collider;
    private _controller: KeyboardController;
    private _mouseController: MouseController;
    private _frame;
    private _mapObjects: (Tile | Character)[] = [];
    private _entities: Character[] = [];
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

        //this._library.sounds('world').light_ambient2.play();
    }

    private subscribeEvents(): void {
        this._camera = new Camera(this._player, this._canvas);
        this._world = new World(this._library, this._canvas, this._bus, this._player);

        this._bus.subscribe('world:generated', (data: { map: Tile[], characters: Character[] }): void => {
            this._mapObjects = [...data.map, ...data.characters];
            this._entities.push(...data.characters);
        });

        this._bus.subscribe('toggleClickState', this._mouseController.toggleStateClick.bind(this._mouseController));
        this._bus.subscribe('game:filterEntities', () => this._entities = this.filterAliveCharacters(this._entities));
        this._bus.subscribe('game:filterColliders', () => this._mapObjects = this.filterAliveCharacters(this._mapObjects));
        this._bus.subscribe('player:attack', (): void => {
            if (!this._player.isAttack) {
                this._player.attack();
            }
        });
    }

    private createPlayer(): Promise<Player> {
        return new Promise((resolve): void => {
            const player: Player = new Player(
                this._library, this._bus, this._canvas, playerConfig, this._entities
            );

            this._entities.push(player);
            resolve(player)
        })
    }

    private handleCollision(): void {
        this._entities.forEach((entity: Character): void => {

            const {x: entityX, y: entityY, id: entityId, type: entityType} = entity;

            // фильтрация массива в диапазоне 128px по x, y
            const collideObjects = this._mapObjects.filter((obj: Tile | Character) => {
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
            collideObjects.forEach((obj: Tile | Character): void => {
                // получить сторону коллизии или же false
                let side: string | boolean = this._collider.checkColliding(entity, obj);

                if (side) {
                    CollisionHandler.handle(entity, obj, side as string);
                }
            });
        });
    }

    private async update(timestamp): Promise<void> {
        this._canvas.clearCanvas();

        await this._camera.update();
        await this.render(timestamp);

        if (this._library.sounds('world').light_ambient2.ended) {
            this._library.sounds('world').light_ambient2.replay();
        }

        this._entities.forEach((entity: Player | Enemy): void => {
            entity.onGround = false;
        });

        await this.handleCollision();
        await this.handleCharacterActionMouse();
        await this.handleCharacterMovement();
        this._frame = window.requestAnimationFrame(this.update.bind(this));
    }

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


    private filterAliveCharacters(obj): Character[] {
        return obj.filter(item => {
            if (item instanceof Character) {
                return !item.isDead;
            }

            return true;
        });
    }

    // private filterAliveCollideCharacters(): void {
    //     this._mapObjects = this._mapObjects.filter((obj: Tile | Character): boolean | Tile => {
    //         if (obj instanceof Character) {
    //             return !obj.isDead;
    //         }
    //
    //         return obj;
    //     });
    // }
    //
    // private filterAliveCharacters(): void {
    //     this._entities = this._entities.filter((entity: Character) => {
    //         return !entity.isDead;
    //     });
    // }
}
