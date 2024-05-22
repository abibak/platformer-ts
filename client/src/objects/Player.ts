import Character from "./Character";
import EventBus from "../EventBus";
import {IPlayer} from "@/types/game";
import Canvas from "./Canvas";

export default class Player extends Character implements IPlayer {
    private _bus: EventBus;

    public constructor
    (
        bus: EventBus,
        canvas: Canvas,
        id: number,
        x: number,
        y: number,
        w: number,
        h: number,
        health: number = 300,
        maxHealth: number = 300,
    ) {
        super(canvas, 'player');
        this.type = 'player';
        this._bus = bus;
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.health = health;
        this.maxHealth = maxHealth;
        this.oldY = this.y;
    }
}