import {IEnemy} from "@/types/game";
import Canvas from "@/objects/Canvas";
import {loadImage} from "@/utils/utils";
import Character from "@/objects/Character";
import EventBus from "@/EventBus";

export default class Enemy extends Character implements IEnemy {
    private _canvas: Canvas;

    public constructor(bus: EventBus, canvas: Canvas, x: number, y: number, w: number, h: number) {
        super(canvas);
        this.type = 'enemy';
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this._canvas = canvas;
        this.setDefaultAnimation();
    }

    public async update(timestamp) {
        loadImage('assets/images/sprites/enemies/fire-warm/idle').then(async path => {
            const {default: sprite} = await import('@/assets/data-sprites/fire-warm.json');
            this.animator.setPath(path, {...sprite.frames.idle, x: this.x, y: this.y});
            await this.animator.update(timestamp);
        });

        this.fall();
    }
}