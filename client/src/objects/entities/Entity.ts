import {IEntity} from "@/types/game";
import GameObject from "@/objects/world/GameObject";

export default class Entity extends GameObject implements IEntity {
    private _oldY: number = 0;

    public health: number;
    public maxHealth: number;
    public damage: number;
    public type: string;
    public name: string;
    public isFall: boolean;

    public set oldY(value: number) {
        this.isFall = value > this._oldY;
        this._oldY = value;
    }
}