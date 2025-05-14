import Character from "@/objects/characters/Character";
import Entity from "@/objects/entities/Entity";

export interface IEntity {
    type: string;
}

export interface ICharacter extends IEntity {
    isMovingLeft: boolean;
    isMovingRight: boolean;
    health: number;
    maxHealth: number;
    isJump: boolean;
    isDead: boolean;
    isFall: boolean;

    attack(entities: Character[]): void;

    jump(): void;

    getHurt(damage: number, entity: Entity): void;

    dead(entity: Entity): void;
}

export interface IPlayer extends ICharacter {
}

export interface IEnemy extends ICharacter {
}

export interface AnimationRenderParams {
    img: HTMLImageElement;
    scale: number;
    w: number;
    h: number;
    x: number;
    y: number;
    xOffset: number;
    yOffset: number;
    scaleX: number;
    scaleY: number;
    type: string;
}

export interface PlayerConfig {
    id: number;
    name: string;
    type: string;
    x: number;
    y: number;
    h: number;
    w: number;
    speed: number;
    maxJumpQuantity: number;
    jumpHeight: number;
    maxJumpHeight: number;
    health: number;
    maxHealth: number;
    damage: number;
    restoreHealth: number;
    animations: string[];
}

export enum ForestTreeTypes {
    DragonWood = 'dragonwood',
    Birch = 'birch',
}

export enum EnemyTypes {
    FireWarm = 'firewarm',
}

export const tilemapSettings = {
    col: 3,
    row: 2,
    tileSize: 64,
}