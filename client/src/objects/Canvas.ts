/* UI Button options */
type ButtonOptions = {
    x: number;
    y: number;
    w: number;
    h: number;
    img: HTMLImageElement;
}

export default class Canvas {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    public width: number;
    public height: number;
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

        this._ctx.restore();
        this._ctx.save();
        this._ctx.translate(x, y);
    }

    public clearCanvas(): void {
        this._ctx.clearRect(0, 0, this.width, this.height);
    }

    public drawUIButtonElement(options: ButtonOptions): void {
        this._ctx.drawImage(options.img, options.x - this.xOffset, options.y - this.yOffset);
    }

    public drawCustomButton(props) {
        this._ctx.fillStyle = props.color;
        this._ctx.fillRect(props.x, props.y, props.w, props.h);

        //this._ctx.fillStyle = '#fff';
        this._ctx.font = '32px Main Font';

        const size: TextMetrics = this._ctx.measureText(props.text)

        const textX = props.x + (props.w - size.width) / 2;
        console.log(textX);

        this._ctx.fillText(props.label, textX, props.y)
    }

    public async drawBackground(img: HTMLImageElement) {
        // смещение по x and y камеры, для фиксирования фона
        this._ctx.drawImage(img, 0 - this.xOffset, 0 - this.yOffset, this.width, this.height);
    }

    public drawTile(tile): void {
        this._ctx.drawImage(tile.img, tile.x, tile.y, tile.w, tile.h);
    }

    public drawAnimation(params): void {
        this._ctx.save();

        if (params.type !== 'player') {
            params.x = params.x - params.xOffset;
            params.y = params.y - params.yOffset;
        }

        this._ctx.scale(params.scaleX, params.scaleY);
        this._ctx.drawImage(
            params.image,
            params.scale - params.scaleOffsetX,
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
        this._ctx.strokeRect(50 - this.xOffset, 50 - this.yOffset, lineHpWidth, 20);

        this._ctx.fillStyle = 'green';
        this._ctx.font = '32px Main Font';
        this._ctx.fillText('HP ' + hp + '/' + maxHp, 50 - this.xOffset, 100 - this.yOffset);
    }

    public drawHealthEnemy(data: any): void {
        this._ctx.strokeStyle = '#000';
        this._ctx.lineWidth = 1.1;
        this._ctx.strokeRect(data.x, data.y - 10, 50, 3);

        this._ctx.fillStyle = 'red';
        this._ctx.fillRect(data.x, data.y - 10, data.hp, 3);
    }

    public drawProgressLoad(progress: number): void {
        this._ctx.strokeStyle = '#000';
        this._ctx.lineWidth = 1;
        this._ctx.strokeRect(300, 300, 400, 12);

        setTimeout(() => {
            this._ctx.fillStyle = 'red';
            this._ctx.fillRect(301, 301, (progress * 4) - 2, 10);
        }, 10);
    }

    public drawNearbyTiles(tile) {
        this._ctx.fillStyle = 'red';
        this._ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
    }
}