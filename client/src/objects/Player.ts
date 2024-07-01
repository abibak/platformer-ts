import Character from "./Character";
import EventBus from "../EventBus";
import {IPlayer, PlayerConfig} from "@/types/game";
import Canvas from "./Canvas";
import Library from "@/library/Library";

export default class Player extends Character implements IPlayer {
    private _canvas: Canvas;
    private _bus: EventBus;
    private _restoreHealth: number;
    private _lastTime: number = 0;
    private _entities: Character[] = [];

    public constructor
    (
        library: Library,
        bus: EventBus,
        canvas: Canvas,
        config: PlayerConfig,
        entities: Character[]
    ) {
        super(canvas, bus, library, 'player');
        this._canvas = canvas;
        this._bus = bus;

        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.width = config.w;
        this.height = config.h;

        this.name = 'player';
        this.type = config.type;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.maxHealth;
        this.damage = config.damage;
        this.jumpHeight = config.jumpHeight;
        this.maxJumpHeight = config.maxJumpHeight;
        this._restoreHealth = config.restoreHealth;
        this._entities = entities;
        this.oldY = this.y;
    }

    public async update(timestamp): Promise<void> {
        super.update(timestamp);

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

    public async attack(): Promise<void> {
        const {w: w, h: h} = await this.getSpriteDataByAnimationName('attack');
        let startX: number;
        let endX: number;

        this.isAttack = true;

        if (!this.isFacingLeft) {
            startX = this.x + this.width / 2;
            endX = this.x + w;
        } else {
            startX = (this.x + this.width) - this.width / 2;
            endX = (this.x + this.width) - w;
        }

        for (const entity: Character of this._entities) {
            if (entity.type === 'enemy') {
                const {x: x, y: y, width: w, height: h} = entity;

                // если противник находится в диапазоне атаки справа или слева
                // добавить условие по y
                if ((entity.x >= startX && entity.x <= endX) ||
                    (entity.x + entity.width >= endX && entity.x <= startX)
                ) {
                    entity.getHurt(this.damage);
                }
            }
        }
    }
}