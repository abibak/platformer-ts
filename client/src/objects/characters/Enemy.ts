import {IEnemy} from "@/types/game";
import Character from "@/objects/characters/Character";
import configSpriteEnemies from "@/assets/data-sprites/enemies.json";

export default class Enemy extends Character implements IEnemy {
    public speed: number = 1.05;

    public constructor(config: any) {
        super(config.x, config.x, config.w, config.h, true, 'enemy');

        this.type = 'enemy';
        this.health = config.health;
        this.maxHealth = config.maxHealth;
        this.damage = config.damage;
        this.speed = config.speed;
        this.jumpHeight = 50;
        this.maxJumpHeight = 20;

        this.setSpriteConfig();

        this._bus.subscribe('enemy:onAttackFrame', (frame) => {
            console.log('attack', frame)
        });
    }

    public async update(timestamp: number, dt: number): Promise<void> {
        super.update(timestamp, dt);

        this._canvas.drawHealthEnemy({
            x: this.x,
            y: this.y,
            hp: this.health
        });
    }

    protected setSpriteConfig(): any {
        this._spriteConfig = configSpriteEnemies[this.name];
    }
}