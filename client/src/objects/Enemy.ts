import {IEnemy} from "@/types/game";
import Canvas from "@/objects/Canvas";
import Character from "@/objects/Character";
import EventBus from "@/EventBus";
import Library from "@/library/Library";

export default class Enemy extends Character implements IEnemy {
    private _canvas: Canvas;
    private _bus: EventBus;
    public speed: number = 1.05;

    public constructor(
        library: Library,
        bus: EventBus,
        canvas: Canvas,
        config: any,
    ) {
        super(canvas, bus, library, 'enemy');
        this._canvas = canvas;
        this._bus = bus;
        this.type = 'enemy';

        this.x = config.x;
        this.y = config.y;
        this.width = config.w;
        this.height = config.h;
        this.health = config.health;
        this.maxHealth = config.maxHealth;

        this.jumpHeight = 50;
        this.maxJumpHeight = 20;
    }

    public async update(timestamp): Promise<void> {
        super.update(timestamp);

        this._canvas.drawHealthEnemy({
            x: this.x,
            y: this.y,
            hp: this.health
        });
    }

    public attack(attacked?: Character): void {
        console.log('attack')
    }
}