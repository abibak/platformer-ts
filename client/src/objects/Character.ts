import Entity from "./Entity";
import {ICharacter, PlayerState} from "@/types/game";
import Animator from "./Animator";
import Canvas from "./Canvas";
import {loadImage} from "@/utils/utils";
import EventBus from "@/EventBus";
import Library from "@/library/Library";

export default class Character extends Entity implements ICharacter {
    public isIdle: boolean = false;
    public isWalk: boolean = false;
    public isMovingLeft: boolean = false;
    public isMovingRight: boolean = false;
    public isAttack: boolean = false;
    public onGround: boolean = false;
    public isDead: boolean = false;
    public isFacingLeft: boolean = false;
    public stats: {
        coins: number;
    }
    public speed: number = 5;
    public isJump: boolean = false;
    public jumpQuantity: number = 0;
    public maxJumpQuantity: number = 2;
    public jumpHeight: number = 10;
    public maxJumpHeight: number = 10;

    public movementPoints: {
        length: number,
        startX: number,
        startY: number,
    } = {};

    protected vy: number = 0;
    protected gravity: number = 0.4;

    protected animator: Animator;

    private readonly _canvas: Canvas;
    private _bus: EventBus;
    private _library: Library;

    public constructor(canvas: Canvas, library: Library, type: string) {
        super();
        this._canvas = canvas;
        this._library = library;
        this.type = type;

        this.setDefaultAnimation();
    }

    public async update(timestamp): Promise<void> {
        this.adjustVerticalMovement();
        this.adjustHorizontalMovement();

        let jsonDataSprite = {};

        const getPath = await this.updateAnimation(); // путь до спрайта

        if (this.type === 'player') {
            jsonDataSprite = (await import('@/assets/data-sprites/player.json')).default;
        } else if (this.type === 'enemy') {
            jsonDataSprite = (await import('@/assets/data-sprites/fire-warm.json')).default;
        }

        const spriteMap = jsonDataSprite.frames[getPath.status];
        const modifiedSpriteMap = this.prepareSpriteMapData(spriteMap); // подготовка данных спрайта к отрисовке

        this.animator.setPath(getPath, modifiedSpriteMap);
        await this.animator.update(timestamp);
    }

    public prepareSpriteMapData(data: any): any {
        let temp = {
            y: this.y,
            scaleX: 0,
            scaleY: 1,
        };

        if (this.isFacingLeft) {
            data.x = -(this.x + (this.width));
            temp.scaleX = -1;
        } else {
            data.x = +this.x;
            temp.scaleX = 1;
        }

        return {...data, ...temp};
    }

    // rename to "updateAnimation"
    public async updateAnimation(): Promise<any> {
        let path: string = '';
        let animation: string = '';

        if (this.type === 'player') {
            path = 'images/sprites/player/';
        } else if (this.type === 'enemy') {
            switch (this.name) {
                case 'fire-warm':
                    path = `images/sprites/enemies/${this.name}/`;
                    break;
            }
        }

        if (!(this.isMovingLeft || this.isMovingRight) && !this.isJump && !this.isFall) {
            this.isIdle = true;
            animation = 'idle';
        }

        if (this.isMovingLeft || this.isMovingRight) {
            if (this.type === 'enemy') {
                animation = 'walk';
            } else {
                //this._library.sounds('player').run.play();
                animation = 'run';
            }
        }

        if (this.isJump) {
            animation = 'jump';
        }

        if (this.isFall) {
            if (this.type === 'enemy') {
                animation = 'idle';
            } else {
                animation = 'fall';
            }
        }

        if (this.isAttack) {
            animation = 'attack';
            this._library.sounds('player').sword_miss.play();
        }

        if (this.animator.currentFrameFinish) {
            if (animation === 'run') {

            }
        }

        if (this.animator.finish) {
            if (animation === 'attack') {
                this._library.sounds('player').sword_miss.finish();
                this._bus.publish('toggleClickState', false);
            }
        }

        let url: string = await loadImage('assets/' + path + animation);

        return {
            url: url,
            status: animation,
        }
    }

    // rename to "setInstanceAnimation"
    public setDefaultAnimation(): void {
        this.animator = new Animator(this._canvas, this.type);
    }

    public startMovingLeft(): void {
        if (!this.isMovingRight) {
            this.isMovingLeft = true;
            this.isFacingLeft = true;
        }
    }

    public startMovingRight(): void {
        if (!this.isMovingLeft) {
            this.isMovingRight = true;
            this.isFacingLeft = false;
        }
    }

    public stopMovingLeft(): void {
        this.isMovingLeft = false;
    }

    public stopMovingRight(): void {
        this.isMovingRight = false;
    }

    protected adjustVerticalMovement(): void {
        this.fall();
    }

    protected adjustHorizontalMovement(): void {
        if (this.isMovingLeft && !this.isAttack) {
            this.x -= this.speed;
        }

        if (this.isMovingRight && !this.isAttack) {
            this.x += this.speed;
        }
    }

    public fall(): void {
        // Cвободное падения
        if (!this.onGround) {
            this.vy += this.gravity;
            this.y += this.vy;
        } else {
            this.jumpQuantity = 0;
            this.isJump = false;
            this.isFall = false;
            this.vy = 0;
        }

        this.oldY = this.y;
    }

    attack() {
    }

    dead() {
    }

    getHurt() {
    }

    jump() {
        this._library.sounds('player').jump.play();

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