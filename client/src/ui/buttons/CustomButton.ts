import Canvas from "@/objects/Canvas";
import UIElement from "@/ui/UIElement";

export default class CustomButton extends UIElement {
    private readonly _canvas: Canvas;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _text: string;

    public className: string = '';

    public constructor
    (
        canvas: Canvas,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
    ) {
        super(x, y, width, height);
        this._canvas = canvas;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._text = text;
    }

    public draw(): void {
        this._canvas.drawCustomButton({
            x: this._x,
            y: this._y,
            w: this._width,
            h: this._height,
            label: this._text,
            color: '#B0543B',
        });
    }
}