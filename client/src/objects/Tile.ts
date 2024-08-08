import {GameObject} from "@/types/game";
import Canvas from "@/objects/Canvas";

type TileTypes = 'wall' | 'grass' | 'stone'

export default class Tile implements GameObject {
    public x: number;
    public y: number;
    public w: number;
    public h: number;
    public collidable: boolean;
    public type: TileTypes;
    public img: HTMLImageElement;

    private readonly _canvas: Canvas;

    public constructor(x: number, y: number, w: number, h: number, collidable: boolean, type: TileTypes, img: HTMLImageElement, canvas: Canvas) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.collidable = collidable;
        this.type = type;
        this.img = img;
        this._canvas = canvas;
    }

    public async update(timestamp: number) {

    }

    public async draw(): Promise<void> {
        this._canvas.drawTile({
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
            img: this.img
        });
    }
}