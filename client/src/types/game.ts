export interface IEntity {
    type: string;
    isFall: boolean;

    setFall(): void;
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

    attack(): void;

    restoreHealth(): void;

    jump(): void;

    getHurt(): void;

    dead(): void;
}

export interface IPlayer extends ICharacter {

}

export interface IEnemy extends IEntity {

}