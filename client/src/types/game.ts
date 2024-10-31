import Character from "@/objects/characters/Character";

export interface IEntity {
    type: string;
}

export interface ICharacter extends IEntity {
    isMovingLeft: boolean;
    isMovingRight: boolean;
    health: number;
    maxHealth: number;
    stats: {
        coins: number;
    }
    isJump: boolean;
    damage: number;
    isDead: boolean;
    isFall: boolean;

    attack(entities: Character[]): void;

    jump(): void;

    getHurt(damage: number): void;

    dead(): void;
}

export interface IPlayer extends ICharacter {
}

export interface IEnemy extends ICharacter {
}

export interface AnimationRenderParams {
    image: HTMLImageElement;
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
}

export interface GameObject {
    x: number;
    y: number;
    h: number;
    w: number;
    collidable: boolean;
    type: string;
    img?: HTMLImageElement;
}

export enum PlayerState {
    Idle,
    Fall,
    Run,
    Attack,
    Jump
}

export enum FireWarmState {
    Idle,
    Walk,
    Attack
}