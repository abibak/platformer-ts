import Entity from "./Entity";
import {ICharacter} from "../types/game";
import Animator from "./Animator";
import Canvas from "./Canvas";

export default class Character extends Entity implements ICharacter {
    public isIdle: boolean; // фиксануть, нигде не проявляется
    public isMovingLeft: boolean;
    public isMovingRight: boolean;
    public isJump: boolean;
    public isAttack: boolean;
    public isFall: boolean = false;
    public onGround: boolean = false;
    public isDead: boolean;
    public isFacingLeft: boolean = false;
    public stats: {
        coins: number;
    }

    public jumpQuantity = 0;
    public maxJumpQuantity = 2;
    public jumpHeight: number = 15;
    protected vy: number = 0;
    protected gravity: number = 0.9;
    private _speed: number;
    private _maxSpeed: number;
    private _jumpForceDecay: number = 0;
    private _maxJumpHeight: number;

    protected animator: Animator;
    private readonly _canvas: Canvas;

    public constructor(canvas: Canvas) {
        super();
        this._canvas = canvas;
    }

    public async getPathToSprite(): Promise<any> {
        const pathToSprite = 'images/sprites/';
        let status = '';

        if (!(this.isMovingLeft || this.isMovingRight) && !this.isJump) {
            this.isIdle = true;
            status = 'idle';
        } else if (this.isMovingLeft || this.isMovingRight) {
            this.isIdle = false;
            status = 'run';
        } else if (this.isJump) {
            this.isIdle = false;
            status = 'jump';
        }

        if (this.isAttack) {
            status = 'attack';
        }

        let pathSprite = await import('@assets/' + pathToSprite + status + '.png');

        return {
            path: pathSprite.default,
            status: status,
        }
    }

    public setDefaultAnimation(): void {
        this.animator = new Animator(this._canvas);
    }

    attack() {
    }

    dead() {
    }

    getHurt() {
    }

    jump() {
        this.jumpQuantity++;

        if (this.jumpQuantity === 2) {
            this.jumpHeight = 10;
        }

        if (this.jumpQuantity <= this.maxJumpQuantity) {
            this.vy = -this.jumpHeight;
            this.onGround = false;
            this.isJump = false;
            this.jumpHeight = 15;
        }
    }

    restoreHealth() {
    }

    public set oldYValue(newValue: number) {
        if (newValue > this.oldY) {
            this.isFall = true;
        }

        this.oldY = newValue;
    }
}