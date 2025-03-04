import Character from "@/objects/characters/Character";

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

    getHurt(damage: number): void;

    dead(): void;
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