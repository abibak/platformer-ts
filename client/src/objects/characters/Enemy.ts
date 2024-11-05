import {IEnemy} from "@/types/game";
import Canvas from "@/objects/Canvas";
import Character from "@/objects/characters/Character";
import EventBus from "@/EventBus";
import Library from "@/library/Library";

export default class Enemy extends Character implements IEnemy {
    public speed: number = 1.05;

    public constructor(
        library: Library,
        bus: EventBus,
        canvas: Canvas,
        config: any,
    ) {
        super(canvas, bus, library, 'enemy');
        this.type = 'enemy';

        this.x = config.x;
        this.y = config.y;
        this.w = config.w;
        this.h = config.h;
        this.health = config.health;
        this.maxHealth = config.maxHealth;
        this.damage = config.damage;
        this.speed = config.speed;

        this.jumpHeight = 50;
        this.maxJumpHeight = 20;

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
}