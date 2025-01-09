import Canvas from "../Canvas";
import {AnimationRenderParams} from "@/types/game";
import EventBus from "@/EventBus";
import {DataSprite} from "@/types/main";
import {log} from "node:util";

export default class Animator {
    private _canvas: Canvas;
    private _bus: EventBus;

    /* данные фрейма */
    private _frameWidth: number;
    private _frameHeight: number;
    private _frameScale: number = 0;
    private _currentFrame: number = 0;
    private _framesCount: number = 0;
    private _image: HTMLImageElement;

    /* параметры fps */
    private _frameRate: number = 10;
    private _lastTime: number = 0;

    private readonly _instanceTypeName: string = '';
    //private _path: string;
    private _actionData: any;
    private _action: string;

    public finish: boolean = false;

    public constructor(canvas: Canvas, bus: EventBus, type: string) {
        this._canvas = canvas;
        this._bus = bus;
        this._instanceTypeName = type;
    }

    public setAnimation(action: string, actionData: DataSprite): void {
        this._actionData = actionData;

        if (action !== this._action) {
            this.finish = false;
            this._currentFrame = 0;
            this._frameScale = 0;
        }

        this._action = action;
    }

    /*public setPath(path: any, actionData: DataSprite): void {
        this._actionData = actionData;

        if (path.status !== this._action) {
            this.finish = false;
            this._currentFrame = 0;
            this._frameScale = 0;
        }

        this._action = path.status;
    }*/

    public async update(timestamp): Promise<void> {
        if (!this._lastTime) {
            this._lastTime = timestamp;
        }

        this.finish = false;

        const deltaTime: number = timestamp - this._lastTime;

        this._frameWidth = this._actionData.w;
        this._frameHeight = this._actionData.h;
        this._framesCount = this._actionData.framesCount;

        this.render({
            img: this._actionData.img,
            scale: this._frameScale,
            w: this._frameWidth,
            h: this._frameHeight,
            x: this._actionData.x,
            y: this._actionData.y,
            type: this._instanceTypeName,
            ...this._actionData,
        });

        /* 1000 / 10 = 100ms
        * смена каждого кадра, каждые 100ms
        * */
        if (deltaTime >= 1000 / this._frameRate) {
            this.nextFrame();
            this._lastTime = timestamp;
        }
    }

    // следующий кадр
    private nextFrame(): void {
        this._currentFrame++;
        this._frameScale += this._actionData.step;

        if (this._currentFrame >= this._framesCount) {
            this._bus.publish('animator:animationFinish', this._action);
            this.finish = true;
            this._frameScale = 0;
            this._currentFrame = 0;
        }
    }

    // рендер анимации
    private render(params: AnimationRenderParams): void {
        this._canvas.drawAnimation(params)
    }
}