import Entity from "./Entity";
import Canvas from "./Canvas";
import Character from "@/objects/Character";

// багулина: при движении камеры по время коллизии, не правильно отрисовывается мир

export default class Camera {
    private _target: Character;
    private _canvas: Canvas;

    public constructor(target: Character, canvas: Canvas) {
        this._target = target;
        this._canvas = canvas;
    }

    public async update(): Promise<void> {
        let targetX: number = (this._target.x - (this._canvas.width / 2)) + this._target.width;
        let targetY: number = (this._target.y - (this._canvas.height / 2)) - this._target.height;

        //если камера справа в конце canvas
        // if ((this._target.x + this._target.width) >= this._canvas.width) {
        //     this._canvas.translateCanvas(-this._canvas.width / 2, targetY);
        //     return;
        // }

        // если камера слева в конце canvas
        // if (targetX <= 0) {
        //     this._canvas.translateCanvas(0, targetY);
        //     return;
        // }

        this._canvas.translateCanvas(-targetX, -targetY);
    }
}