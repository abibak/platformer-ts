import Character from "./Character";
import {IPlayer, PlayerConfig} from "@/types/game";
import GameObject from "@/objects/world/GameObject";
import configSpritePlayer from "@/assets/data-sprites/player.json";

export default class Player extends Character implements IPlayer {
    private _restoreHealth: number;
    private _lastTime: number = 0;

    public constructor
    (
        config: PlayerConfig,
        entities: GameObject[]
    ) {
        super(config.x, config.y, config.w, config.h, true, 'player');

        this.id = 1;
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

        this.setSpriteConfig();

        this._bus.subscribe('player:attack', () => this.attack(entities));
    }

    public async update(timestamp: number, dt: number): Promise<void> {
        super.update(timestamp, dt);

        if (this.mode === 'debug') {
            this.collidable = false;
        }

        this._canvas.drawHealthPlayer(this.health, this.maxHealth);

        if (!this._lastTime) {
            this._lastTime = timestamp;
        }

        const deltaTime: number = Math.floor(timestamp - this._lastTime);

        if (deltaTime >= 1000) {
            this._lastTime = timestamp;
        }
    }

    protected setSpriteConfig(): any {
        this._spriteConfig = configSpritePlayer
    }

    public restoreHealth(value: number): void {
        this.health += value;
    }
}