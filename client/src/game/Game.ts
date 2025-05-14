import App from '@/App';
import Player from '../objects/characters/Player';
import World from '../objects/world/World';
import EventBus from '../EventBus';
import Canvas from '../objects/Canvas';
import KeyboardController from '../controllers/KeyboardController';
import MouseController from '../controllers/MouseController';
import Camera from '../objects/Camera';
import Collision from '@/objects/Collision';
import playerConfig from '@/assets/data/player.json';
import GameObject from '@/objects/world/GameObject';
import GameObjectsStore from '@/state/GameObjectsStore';
import Library from '@/library/Library';
import GameScreen from '@/objects/screens/GameScreen';

export default class Game {
    public static dt: number = 0;
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
    public gameState: string = 'pause';
    public isPause: boolean = false;

    public static TEST: any[] = [];

    private _frame;
    private _lastTime: number = 0;

    public constructor(
        app: App,
        bus: EventBus,
        controller: KeyboardController,
        mouseController: MouseController
    ) {
        this._app = app;
        this._library = Library.getInstance();
        this._gameObjectsStore = GameObjectsStore.getInstance();
        this._bus = bus;
        this._canvas = Canvas.getInstance();
        this._collision = new Collision();
        this._controller = controller;

        this.subscribeEvents();

        //this._library.sounds().lightAmbient2.play();
    }

    public static setForTest(item: any) {
        this.TEST.push(item);
    }

    private subscribeEvents(): void {
        this._bus.subscribe('game:start', () => {
            this.gameState = 'started';
            this._app.setScreen(new GameScreen);
        });
        this._bus.subscribe('mouse:leftClick', () => {
            if (this.gameState !== 'pause') {
                this._player.attack(this._world.currentChunk.entities);
            }
        });
    }

    public async init(): Promise<void> {
        try {
            await this.createPlayer();
            this._camera = new Camera(this._player);
            this._world = new World(5, 5, this._player);
            
            await this.update(0);
            this._bus.unsubscribe('game:init');
        } catch (error) {
            console.log('Ошибка инициализации.', error);
        }
    }

    private async update(timestamp: number): Promise<void> {
        if (!this._lastTime) {
            this._lastTime = timestamp;
        }

        const dt: number = (timestamp - this._lastTime) / 1000;
        this._lastTime = timestamp;

        Game.dt = dt;

        this._canvas.clearCanvas();

        if (this.gameState === 'started') {
            await this._camera.update();
            await this.render(timestamp);

            await this._player.update(timestamp);

            this.handleCollision();
            this.handleCharacterMovement();

            if (this._library.sounds().lightAmbient2.ended) {
                this._library.sounds().lightAmbient2.replay();
            }
        }

        await this._app.update();

        this._frame = window.requestAnimationFrame(this.update.bind(this));
    }

    private async createPlayer(): Promise<void> {
        try {
            this._player = this._gameObjectsStore.add(new Player(playerConfig));
            this._player.mode = 'default';
        } catch (e) {
            throw e;
        }
    }

    // проверять коллизию только в текущем чанке
    private handleCollision(): void {
        const activeChunk = this._world.currentChunk;

        const tiles = activeChunk.tiles;
        const entitiesChunk = activeChunk.entities;

        const allEntities = [...entitiesChunk, this._player];
        const allObjects = [];

        for (const rowTiles of tiles) {
            for (const tile of rowTiles) {
                if (tile.collidable) {
                    allObjects.push(tile);
                }
            }
        }

        for (const entity of allEntities) {
            this.checkIntersections(entity, allObjects)
        }
    }

    private checkIntersections(entity, objects: GameObject[]) {
        for (const obj of objects) {
            const collisionInfo = this._collision.detectCollision(
                entity,
                obj
            );

            if (collisionInfo) {
                this._collision.resolveCollision(entity, obj, collisionInfo);
            }
        }
    }

    private async render(timestamp: number): Promise<void> {
        await this._world.update(timestamp);
        this._canvas.drawHealthPlayer(
            this._player.health,
            this._player.maxHealth
        );

        for (const item of Game.TEST) {
            this._canvas.testFillColorChunks({
                w: item.w,
                h: item.h,
                x: item.x,
                y: item.y,
            });
        }
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
            this.defaultPlayerMovement();
        } else {
            this.debugPlayerMovement();
        }
    }
}
