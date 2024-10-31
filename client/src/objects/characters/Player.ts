import Character from "./Character";
import EventBus from "../../EventBus";
import {GameObject, IPlayer, PlayerConfig} from "@/types/game";
import Canvas from "../Canvas";
import Library from "@/library/Library";

export default class Player extends Character implements IPlayer {
    private _canvas: Canvas;
    private _bus: EventBus;
    private _restoreHealth: number;
    private _lastTime: number = 0;

    public constructor
    (
        library: Library,
        bus: EventBus,
        canvas: Canvas,
        config: PlayerConfig,
        entities: GameObject[]
    ) {
        super(canvas, bus, library, 'player');
        this._canvas = canvas;
        this._bus = bus;

        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.w = config.w;
        this.h = config.h;

        this.name = 'player';
        this.type = config.type;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.maxHealth;
        this.damage = config.damage;
        this.jumpHeight = config.jumpHeight;
        this.maxJumpHeight = config.maxJumpHeight;
        this.maxJumpQuantity = config.maxJumpQuantity;
        this._restoreHealth = config.restoreHealth;
        this.oldY = this.y;
    }

    public async update(timestamp: number, dt: number): Promise<void> {
        super.update(timestamp, dt);

        await this._canvas.drawHealthPlayer(this.health, this.maxHealth);

        if (!this._lastTime) {
            this._lastTime = timestamp;
        }

        const deltaTime: number = Math.floor(timestamp - this._lastTime);

        if (deltaTime >= 1000) {
            this._lastTime = timestamp;
        }
    }

    public restoreHealth(value: number): void {
        this.health += value;
    }
}