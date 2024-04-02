import {IEntity} from "../types/game";

export default class Entity implements IEntity {
    private _id: number;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    public health: number;
    public maxHealth: number;
    public damage: number;
    public type;

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
    };

    public get y() {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    };

    public get width() {
        return this._width;
    }

    public set width(value: number) {
        this._width = value;
    };

    public get height() {
        return this._height;
    }

    public set height(value: number) {
        this._height = value;
    };
}