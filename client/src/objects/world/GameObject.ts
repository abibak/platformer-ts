export default abstract class GameObject {
    private _id: number;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    public collidable: boolean;

    public constructor(id: number, x: number, y: number, width: number, height: number, collidable: boolean) {
        this._id = id;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this.collidable = collidable;
    }

    public get id() {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get x() {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
    }

    public get y() {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
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