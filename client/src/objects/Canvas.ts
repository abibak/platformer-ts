/* UI Button options */
type ButtonOptions = {
    x: number;
    y: number;
    w: number;
    h: number;
    img: HTMLImageElement;
}

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

    public context(): CanvasRenderingContext2D {
        return this._ctx;
    }

    // Смещение Canvas элементов относительно объекта центрирования
    public translateCanvas(x: number, y: number): void {
        // параметры xOffset и yOffset, смещение объектов относительно камеры
        this.xOffset = x;
        this.yOffset = y;

        this._ctx.save();
        this._ctx.translate(x, y);
    }

    // Очитска Canvas
    public clearCanvas(): void {
        this._ctx.clearRect(0, 0, this.width, this.height);
    }

    public drawUIButtonElement(options: ButtonOptions): void {
        this._ctx.drawImage(options.img, options.x - this.xOffset, options.y - this.yOffset);
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
        if (params.type !== 'player') {
            params.x = params.x - params.xOffset + this.xOffset;
            params.y = params.y - params.yOffset + this.yOffset;
        }

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
        this._ctx.strokeRect(params.x - params.xOffset, params.y - params.yOffset, params.w + params.xOffset, params.h);
        this._ctx.restore();
    }

    public drawHealthPlayer(hp: number, maxHp: number): void {
        const lineHpWidth: number = 200;

        const percent: number = Math.floor(hp / maxHp * 100);

        this._ctx.fillStyle = 'red';
        this._ctx.strokeStyle = '#000';
        this._ctx.lineWidth = 1;
        this._ctx.fillRect(50 - this.xOffset, 50 - this.yOffset, percent * 2, 20);
        this._ctx.strokeRect(50- this.xOffset, 50 - this.yOffset, lineHpWidth, 20);

        this._ctx.fillStyle = 'green';
        this._ctx.font = '32px Main Font';
        this._ctx.fillText('HP ' + hp + '/' + maxHp, 50 - this.xOffset, 100 - this.yOffset);
    }
}