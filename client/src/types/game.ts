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