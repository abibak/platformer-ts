import {IEnemy} from "@/types/game";
import Canvas from "@/objects/Canvas";
import Character from "@/objects/Character";
import EventBus from "@/EventBus";

export default class Enemy extends Character implements IEnemy {
    private _bus: EventBus;
    public speed: number = 1.5;

    public constructor(
        bus: EventBus,
        canvas: Canvas,
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        super(canvas, 'enemy');
        this.type = 'enemy';
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this._bus = bus;
    }
}