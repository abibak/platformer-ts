import Entity from "./Entity";
import Canvas from "./Canvas";
import EventBus from "../EventBus";

export default class Camera {
    private _target: Entity;
    private _canvas: Canvas;
    private _bus: EventBus;
    public offsetX: number = 0;
    public offsetY: number = 0;

    public constructor(target: Entity, canvas: Canvas, bus: EventBus) {
        this._target = target;
        this._canvas = canvas;
        this._bus = bus;
    }

    public update(): void {
        let targetX = (this._target.x - (this._canvas.width / 2)) + (this._target.width);
        let targetY = (this._target.y - (this._canvas.height / 2)) - this._target.height;

        if (this._target.x >= this._canvas.width) {
            this._canvas.translateCanvas(-this._canvas.width / 2, -targetY);
            return;
        }

        if (targetX <= 0) {
            this._canvas.translateCanvas(-0, -targetY);
            return;
        }


        this._canvas.translateCanvas(-targetX, -targetY);
    }
}