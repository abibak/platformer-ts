import {IEntity} from "@/types/game";
import GameObject from "@/objects/GameObject";

export default class Entity extends GameObject implements IEntity {
    //private _id: number;
    // private _x: number;
    // private _y: number;
    // private _width: number;
    // private _height: number;
    private _oldY: number = 0;

    public health: number;
    public maxHealth: number;
    public damage: number;
    public type: string;
    public name: string;
    public isFall: boolean;

    // public get id() {
    //     return this._id;
    // }
    //
    // public set id(value: number) {
    //     this._id = value;
    // }
    //
    // public get x() {
    //     return this._x;
    // }
    //
    // public set x(value: number) {
    //     this._x = value;
    // }
    //
    // public get y() {
    //     return this._y;
    // }
    //
    // public set y(value: number) {
    //     this._y = value;
    // }
    //
    // public get w() {
    //     return this._width;
    // }
    //
    // public set w(value: number) {
    //     this._width = value;
    // }
    //
    // public get h() {
    //     return this._height;
    // }
    //
    // public set h(value: number) {
    //     this._height = value;
    // }

    public set oldY(value: number) {
        this.isFall = value > this._oldY;
        this._oldY = value;
    }
}