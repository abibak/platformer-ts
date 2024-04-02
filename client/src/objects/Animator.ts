import Canvas from "./Canvas";
import idle from '../assets/images/sprites/idle.png';
import {makeLogger} from "ts-loader/dist/logger";

interface RenderParams {
    image: HTMLImageElement;
    scale: number;
    w: number;
    h: number;
    x: number;
    y: number;
    xOffset: number;
    yOffset: number;
    scaleX: number;
    scaleY: number;
}

export default class Animator {
    private _canvas: Canvas;
    private _img: HTMLImageElement;
    private _frameWidth: number;
    private _frameHeight: number;
    private _frameScale: number = 0;

    private _currentFrame: number = 0;
    private _framesCount: number = 0;
    private _frameRate: number = 10;
    private _lastTime: number = 0;

    private _path: string;
    private _spriteMap: any;

    private _action: string;

    public constructor(canvas: Canvas) {
        this._canvas = canvas;
    }

    public async createImage(src: string): Promise<any> {
        return new Promise(resolve => {
            const img = new Image;
            img.src = src;
            img.onload = () => resolve(img);
        });
    }

    /*
    * path: Путь до спрайта
    * spriteMap: Данные активного спрайта
    * */
    public setPath(path: any, spriteMap: any): void {
        this._path = path.path;
        this._spriteMap = spriteMap;

        if (path.status !== this._action) {
            this._currentFrame = 0;
            this._frameScale = 0;
        }

        this._action = path.status;
    }

    public async update(timestamp) {
        // Перенести блок
        if (!this._img) {
            await this.createImage(idle).then(img => {
                this._img = img;
            });
        }

        if (!this._lastTime) {
            this._lastTime = timestamp;
        }

        this._img.src = this._path;

        const deltaTime = timestamp - this._lastTime;

        this._frameWidth = this._spriteMap.w;
        this._frameHeight = this._spriteMap.h;
        this._framesCount = this._spriteMap.framesCount

        this.render({
            image: this._img,
            scale: this._frameScale,
            w: this._frameWidth,
            h: this._frameHeight,
            x: this._spriteMap.x,
            y: this._spriteMap.y,
            xOffset: this._spriteMap.xOffset,
            yOffset: this._spriteMap.yOffset,
            scaleX: this._spriteMap.scaleX,
            scaleY: this._spriteMap.scaleY,
        });

        if (deltaTime > 1000 / this._frameRate) {
            this.nextFrame();
            this._lastTime = timestamp;
        }
    }

    // Следующий кадр
    public nextFrame(): void {
        this._currentFrame++;
        this._frameScale += this._spriteMap.step;

        if (this._currentFrame >= this._framesCount) {
            this._frameScale = 0;
            this._currentFrame = 0;
        }
    }

    // Рендер анимации и передача данных методу Canvas для отрисовки
    public render(params: RenderParams): void {
        this._canvas.drawAnimation(params);
    }
}