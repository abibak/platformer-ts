import {IEntity} from "@/types/game";
import GameObject from "@/objects/world/GameObject";

export default class Entity extends GameObject implements IEntity {
    public type: string;
    public name: string;
    public isUpdate: boolean = true;
}