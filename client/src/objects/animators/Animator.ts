import Canvas from "../Canvas";
import {AnimationRenderParams} from "@/types/game";
import EventBus from "@/EventBus";

export default class Animator {
    private _canvas: Canvas;
    private _bus: EventBus;
    private readonly _img: HTMLImageElement;

    /* данные фрейма */
    private _frameWidth: number;
    private _frameHeight: number;
    private _frameScale: number = 0;
    private _currentFrame: number = 0;
    private _framesCount: number = 0;

    /* параметры fps */
    private _frameRate: number = 10;
    private _lastTime: number = 0;

    private readonly _instanceTypeName: string = '';
    private _path: string;
    private _spriteMap: any;
    private _action: string;

    public finish: boolean = false;

    public constructor(canvas: Canvas, bus: EventBus, type: string) {
        this._canvas = canvas;
        this._bus = bus;
        this._img = new Image;
        this._instanceTypeName = type;
    }

    public setPath(path: any, spriteMap: any, frameEvents = undefined): void {
        this._path = path.url ?? path;
        this._spriteMap = spriteMap;

        if (path.status !== this._action) {
            this.finish = false;
            this._currentFrame = 0;
            this._frameScale = 0;
        }

        this._action = path.status;
    }

    public async update(timestamp): Promise<void> {
        if (!this._lastTime) {
            this._lastTime = timestamp;
        }

        this._img.src = this._path;
        this.finish = false;

        const deltaTime: number = timestamp - this._lastTime;

        this._frameWidth = this._spriteMap.w;
        this._frameHeight = this._spriteMap.h;
        this._framesCount = this._spriteMap.framesCount;

        this.render({
            image: this._img,
            scale: this._frameScale,
            w: this._frameWidth,
            h: this._frameHeight,
            x: this._spriteMap.x,
            y: this._spriteMap.y,
            type: this._instanceTypeName,
            ...this._spriteMap,
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
        this._frameScale += this._spriteMap.step;

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