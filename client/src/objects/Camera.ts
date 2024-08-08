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
        let targetX: number = (this._target.x - (window.innerWidth / 2)) + this._target.w;
        let targetY: number = (this._target.y - (window.innerHeight / 2)) - this._target.h;

        this._canvas.translateCanvas(-targetX, -targetY);
    }
}