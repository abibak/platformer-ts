import EventBus from "@/EventBus";
import Canvas from "@/objects/Canvas";

export default class GameObject {
    private _id: number = 0;
    private _x: number;
    private _y: number;
    private _oldX: number = 0;
    private _oldY: number = 0;
    private _width: number;
    private _height: number;

    protected _bus: EventBus;
    protected _canvas: Canvas;

    public collidable: boolean;
    public img: HTMLImageElement;

    public constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        collidable: boolean,
        img?: HTMLImageElement
    ) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this.collidable = collidable;
        this.img = img;
        this._bus = EventBus.getInstance();
        this._canvas = Canvas.getInstance();

        this._bus.publish('game:addGameEntity', this);
    }

    public draw(): void {
        this._canvas.drawWorldObject(this._x, this._y, this._width, this._height, this.img);
    }

    public get id(): number {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
    }

    public set oldX(value: number) {
        this._oldX = value;
    }

    public get oldX() {
        return this._oldX;
    }

    public get y() {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    }

    public set oldY(value: number) {
        this._oldY = value;
    }

    public get oldY() {
        return this._oldY;
    }

    public get w() {
        return this._width;
    }

    public set w(value: number) {
        this._width = value;
    }

    public get h() {
        return this._height;
    }

    public set h(value: number) {
        this._height = value;
    }

    public centerX(): number {
        return this._x + (this._width / 2);
    }

    public centerY(): number {
        return this._y + (this._height / 2);
    }

    public top(): number {
        return this._y;
    }

    public bottom(): number {
        return this._y + this._height;
    }

    public left(): number {
        return this._x;
    }

    public right(): number {
        return this.x + this._width;
    }
}