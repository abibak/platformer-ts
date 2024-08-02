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
        this.damage = config.damage;

        this.jumpHeight = 50;
        this.maxJumpHeight = 20;

        this._bus.subscribe('enemy:onAttackFrame', (frame) => {
            console.log('attack', frame)
        });
    }

    public async update(timestamp): Promise<void> {
        super.update(timestamp);

        this._canvas.drawHealthEnemy({
            x: this.x,
            y: this.y,
            hp: this.health
        });
    }

    public async attack(attacked?: Character): Promise<void> {
        const {w: w, h: h} = await this.getSpriteDataByAnimationName('attack');
        let startX: number;
        let endX: number;

        if (!this.isFacingLeft) {
            startX = this.x + this.width / 2;
            endX = this.x + w;
        } else {
            startX = (this.x + this.width) - this.width / 2;
            endX = (this.x + this.width) - w;
        }

        // если противник находится в диапазоне атаки справа или слева
        // добавить условие по y
        if (!this.isHurt && (attacked.x >= startX && attacked.x <= endX) ||
            (attacked.x + attacked.width >= endX && attacked.x <= startX)
        ) {
            this.isAttack = true;
            console.log(this)
            attacked.getHurt(this.damage);
        }
    }
}