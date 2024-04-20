import Entity from "./Entity";
import {ICharacter} from "@/types/game";
import Animator from "./Animator";
import Canvas from "./Canvas";
import {loadImage} from "@/utils/utils";

export default class Character extends Entity implements ICharacter {
    public isIdle: boolean; // фиксануть, нигде не проявляется
    public isMovingLeft: boolean;
    public isMovingRight: boolean;
    public isAttack: boolean;
    public onGround: boolean = false;
    public isDead: boolean;
    public isFacingLeft: boolean = false;
    public stats: {
        coins: number;
    }
    public speed: number = 5;
    public isJump: boolean = false;
    public jumpQuantity = 0;
    public maxJumpQuantity = 2;
    public jumpHeight: number = 10;
    public maxJumpHeight: number = 10;
    protected vy: number = 0;
    protected gravity: number = 0.4;

    protected animator: Animator;
    private readonly _canvas: Canvas;

    public constructor(canvas: Canvas) {
        super();
        this._canvas = canvas;
    }

    public async getPathToSprite(): Promise<any> {
        const pathToSprite = 'images/sprites/';
        let animation = '';

        if (!(this.isMovingLeft || this.isMovingRight) && !this.isJump && !this.isFall) {
            this.isIdle = true;
            animation = 'idle';
        }

        if (this.isMovingLeft || this.isMovingRight) {
            animation = 'run';
        }

        if (this.isJump) {
            animation = 'jump';
        }

        if (this.isFall) {
            animation = 'fall';
        }

        if (this.isAttack) {
            animation = 'attack';
        }

        const url: string = await loadImage('assets/' + pathToSprite + animation);

        return {
            path: url,
            status: animation,
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
            this.jumpHeight = (0.8 * this.jumpHeight);
        }

        if (this.jumpQuantity <= this.maxJumpQuantity) {
            this.vy = -this.jumpHeight;
            this.onGround = false;
            this.isJump = false;
            this.jumpHeight = this.maxJumpHeight;
        }
    }

    restoreHealth() {
    }
}