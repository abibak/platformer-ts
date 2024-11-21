import Canvas from "@/objects/Canvas";
import GameObject from "@/objects/world/GameObject";

type TileTypes = 0 | 1;

export default class Tile extends GameObject {
    private static _staticId: number = 0;
    public type: TileTypes = 0;
    public img: HTMLImageElement;

    private readonly _canvas: Canvas;

    public constructor(x: number, y: number, w: number, h: number, collidable: boolean, img: HTMLImageElement, canvas: Canvas) {
        Tile._staticId += 1;
        super(Tile._staticId, x, y, w, h, collidable);
        this.img = img;
        this._canvas = canvas;
    }

    public async update(timestamp: number) {

    }

    public async draw(): Promise<void> {
        if (this.type === 1) {
            this._canvas.drawTile({
                x: this.x,
                y: this.y,
                w: this.w,
                h: this.h,
                img: this.img
            });
        }
    }
}