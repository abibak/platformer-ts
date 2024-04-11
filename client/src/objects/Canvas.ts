import EventBus from "../EventBus";

export default class Canvas {
    public width: number;
    public height: number;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    public xOffset: number = 0;
    public yOffset: number = 0;

    public constructor() {
        this._canvas = <HTMLCanvasElement>document.getElementById('game');

        this.width = 2000;
        this.height = 1000;

        if (this._canvas.getContext) {
            this._canvas.width = this.width;
            this._canvas.height = this.height;

            this._ctx = this._canvas.getContext('2d');
        }
    }

    // Смещение Canvas относительно объекта центрирования
    public translateCanvas(x: number, y: number): void {
        this.xOffset = x;
        this.yOffset = y;

        this._ctx.save();
        this._ctx.translate(x, y);
    }

    // Очитска Canvas
    public clearCanvas(): void {
        this._ctx.clearRect(0, 0, this.width, this.height);
    }

    // Отрисовка фона
    public drawBackground(img: HTMLImageElement) {
        // смещение по x and y камеры, для фиксирования фона
        this._ctx.drawImage(img, 0 - this.xOffset, 0 - this.yOffset, this.width, this.height);
    }

    // Отрисовка объектов
    public drawMap(platform): void {
        this._ctx.drawImage(platform.img, platform.x, platform.y, platform.w, platform.h);
    }

    // Общая функция отрисовки анимации на canvas
    // Добавить тип для params
    public drawAnimation(params): void {
        this._ctx.scale(params.scaleX, params.scaleY);
        this._ctx.drawImage(
            params.image,
            params.scale,
            0,
            params.w + params.xOffset,
            params.h,
            params.x - params.xOffset,
            params.y - params.yOffset,
            params.w + params.xOffset,
            params.h
        );
        this._ctx.strokeStyle = "red";
        this._ctx.lineWidth = .2;
        this._ctx.strokeRect(params.x, params.y - params.yOffset, params.w, params.h);
        this._ctx.restore();
    }
}