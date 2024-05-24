import {IEnemy} from "@/types/game";
import Canvas from "@/objects/Canvas";
import Character from "@/objects/Character";
import EventBus from "@/EventBus";
import Library from "@/library/Library";

export default class Enemy extends Character implements IEnemy {
    private _bus: EventBus;
    public speed: number = 1.05;

    public constructor(
        library: Library,
        bus: EventBus,
        canvas: Canvas,
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        super(canvas, library, 'enemy');
        this.type = 'enemy';
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this._bus = bus;
    }
}