import Entity from "./Entity";
import {ICharacter} from "@/types/game";
import Animator from "./Animator";
import Canvas from "./Canvas";
import EventBus from "@/EventBus";
import Library from "@/library/Library";
import {Sprite, SpriteList} from "@/types/main";
import configSpritePlayer from "@/assets/data-sprites/player.json";
import configSpriteEnemies from "@/assets/data-sprites/enemies.json";

export default class Character extends Entity implements ICharacter {
    public isIdle: boolean = false;
    public isWalk: boolean = false;
    public isMovingLeft: boolean = false;
    public isMovingRight: boolean = false;
    public isAttack: boolean = false;
    public isHurt: boolean = false;
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

    // использование для класса Brain
    public movementPoints: {
        length: number,
        startX: number,
        startY: number,
    } = {};

    public collisionX: string = '';
    public collisionY: string = '';

    protected vy: number = 0;
    protected gravity: number = 0.4;

    protected animator: Animator;
    protected action: string = '';

    private readonly _canvas: Canvas;
    private _bus: EventBus;
    private _library: Library;

    public constructor(canvas: Canvas, bus: EventBus, library: Library, type: string) {
        super();
        this._canvas = canvas;
        this._bus = bus;
        this._library = library;
        this.type = type;

        this._bus.subscribe('animator:animationFinish', this.animationFinish.bind(this));
        this.setDefaultAnimation();
    }

    private animationFinish(animationName: string): void {
        if (animationName === 'attack') {
            this._library.sounds('player').sword_miss.finish();
            this._bus.publish('toggleClickState', false);
        }

        if (animationName === 'death') {
            this._bus.publish('game:filterEntities');
        }

        if (animationName === 'hurt') {
            this.isHurt = false;
        }
    }

    public async update(timestamp): Promise<void> {
        this.adjustVerticalMovement();
        this.adjustHorizontalMovement();

        let frameList: SpriteList;
        const getPath = await this.updateAnimation(); // обработка состояние персонажа

        if (this.type === 'player') {
            frameList = configSpritePlayer;
        } else if (this.type === 'enemy') {
            frameList = configSpriteEnemies[this.name];
        }

        const spriteMap: Sprite = frameList.frames[getPath.status];

        await this.animator.setPath(getPath, this.reflectSprite(spriteMap));
        await this.animator.update(timestamp);
    }

    protected async getSpriteDataByAnimationName(action: string): Promise<Sprite> {
        if (this.type === 'player') {
            return configSpritePlayer.frames[action];
        }
    }

    public reflectSprite(data: any): any {
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

    public async updateAnimation(): Promise<any> {
        // let animation: string = '';

        if (this.isDead) {
            this.action = 'death';
        }

        if (!(this.isMovingLeft || this.isMovingRight) && !this.isJump && !this.isFall && !this.isDead) {
            this.isIdle = true;
            this.action = 'idle';
        }

        if (this.isMovingLeft || this.isMovingRight) {
            if (this.type === 'enemy') {
                this.action = 'walk';
            } else {
                this.action = 'run';
            }
        }

        if (this.isHurt) {
            this.action = 'hurt';
        }

        if (this.isJump) {
            this.action = 'jump';
        }

        if (this.isFall) {
            if (this.type === 'enemy') {
                this.action = 'idle';
            } else {
                this.action = 'fall';
            }
        }

        if (this.isAttack) {
            this.action = 'attack';
            this._library.sounds('player').sword_miss.play();
        }

        let url: string = this._library.sprites()[this.name][this.action].url;

        return {
            url: url,
            status: this.action,
        }
    }

    // rename to "setInstanceAnimation"
    public setDefaultAnimation(): void {
        this.animator = new Animator(this._canvas, this._bus, this.type);
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

    public attack(): void {

    }

    dead(): void {
        this._bus.publish('game:filterColliders');
        console.log('death:', this);
    }

    getHurt(damage: number): void {
        if (damage >= this.health) {
            this.health = 0;
            this.isDead = true;
            this.dead();
            return;
        }

        this.isHurt = true;
        this.health -= damage;
    }

    jump(): void {
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
}