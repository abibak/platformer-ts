type BackgroundProperties = { [key: string]: string | number }

export default class Canvas {
    public width: number;
    public height: number;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    public constructor() {
        this._canvas = <HTMLCanvasElement>document.getElementById('game');

        this.width = 1920;
        this.height = 920;

        if (this._canvas.getContext) {
            this._canvas.width = this.width;
            this._canvas.height = this.height;

            this._ctx = this._canvas.getContext('2d');
        }
    }

    // Clear canvas
    public clearCanvas(): void {
        this._ctx.clearRect(0, 0, this.width, this.height);
    }

    public drawBackground(path: string) {
        const styles: BackgroundProperties = {
            background: `url(${path})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
        }

        const element: HTMLElement = document.querySelector('.wrapper');

        for (const prop in styles) {
            element.style[prop] = <string>styles[prop];
        }
    }

    // Draw map method
    public drawMap(platform): void {
        this._ctx.drawImage(platform.img, platform.x, platform.y, platform.w, platform.h);
    }

    // Общая функция отрисовки объектов на canvas
    // Добавить тип для params
    public drawAnimation(params): void {
        this._ctx.save();
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