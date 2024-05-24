export interface IEntity {
    type: string;
}

export interface ICharacter extends IEntity {
    isMovingLeft: boolean;
    isMovingRight: boolean;
    stats: {
        coins: number;
    }
    isJump: boolean;
    damage: number;
    isDead: boolean;
    isFall: boolean;

    attack(): void;

    restoreHealth(): void;

    jump(): void;

    getHurt(): void;

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