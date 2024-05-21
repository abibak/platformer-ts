import Canvas from "@/objects/Canvas";
import UIElement from "@/ui/UIElement";
import {loadImage} from "@/utils/utils";

export default class Button extends UIElement {
    private readonly _canvas: Canvas;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _img: HTMLImageElement;

    public className: string = '';

    public constructor
    (
        canvas: Canvas,
        x: number,
        y: number,
        width: number,
        height: number,
        path: string,
    ) {
        super(x, y, width, height);
        this._canvas = canvas;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        loadImage(path).then(url => {
            this._img = new Image;
            this._img.src = url;
        });
    }

    public draw(): void {
        this._canvas.drawUIButtonElement({
            x: this._x,
            y: this._y,
            w: this._width,
            h: this._height,
            img: this._img,
        });
    }
}