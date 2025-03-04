import Entity from "../entities/Entity";
import {ICharacter} from "@/types/game";
import Animator from "../animators/Animator";
import Canvas from "../Canvas";
import EventBus from "@/EventBus";
import Library from "@/library/Library";
import {SpriteActionList} from "@/types/main";
import configSpritePlayer from "@/assets/data-sprites/player.json";
import configSpriteEnemies from "@/assets/data-sprites/enemies.json";
import GameObject from "@/objects/world/GameObject";

export default class Character extends Entity implements ICharacter {
    public mode: 'debug' | 'default' = 'default';
    public isIdle: boolean = false;
    public isWalk: boolean = false;
    public isMovingLeft: boolean = false;
    public isMovingRight: boolean = false;
    public isAttack: boolean = false;
    public isHurt: boolean = false;
    public onGround: boolean = false;
    public isDead: boolean = false;
    public isFacingLeft: boolean = false;
    public speed: number = 0;
    public speedMultiplier: number = 1;
    public isJump: boolean = false;
    public jumpQuantity: number = 0;
    public maxJumpQuantity: number = 2;
    public jumpHeight: number = 10;
    public maxJumpHeight: number = 10;

    // для класса Brain
    public movementPoints: {
        length: number,
        startX: number,
        startY: number,
    } = {
        length: 0,
        startX: 0,
        startY: 0,
    };

    public collisionX: string = '';
    public collisionY: string = '';

    protected vy: number = 0;
    protected gravity: number = 0.45;

    protected animator: Animator;
    protected action: string = '';

    protected readonly _bus: EventBus;
    protected readonly _library: Library;
    protected readonly _canvas: Canvas;

    private static currentId: number = 0;
    private _config: SpriteActionList | null;

    public constructor(
        id: number,
        x: number,
        y: number,
        w: number,
        h: number,
        collidable: boolean,
        type: string
    ) {
        super(id, x, y, w, h, collidable);
        this._canvas = Canvas.getInstance();
        this._bus = EventBus.getInstance();
        this._library = Library.getInstance();
        this.type = type;
        this.id = Character.generateId();

        this._bus.subscribe('animator:animationFinish', this.animationFinish.bind(this));

        this._config = this.getConfig();
        this.setInstanceAnimation();
    }

    private static generateId(): number {
        return this.currentId++;
    }

    private animationFinish(animationName: string): void {
        if (animationName === 'attack') {
            this._library.sounds().swordMiss.finish();
            this._library.sounds().swordAttack.finish();
            this.isAttack = false;
            this._bus.publish('toggleClickState', this.isAttack);
        }

        if (animationName === 'death') {
            this._bus.publish('game:filterEntities');
        }

        if (animationName === 'hurt') {
            this.isHurt = false;
        }
    }

    public async update(timestamp: number, dt: number): Promise<void> {
        if (this.mode === 'default') {
            this.adjustVerticalMovement(dt);
            this.adjustHorizontalMovement(dt);
        }

        this.onGround = false;

        await this.updateAnimation(); // обработка состояние персонажа

        const getActionImage = this._library.sprites()[this.name][this.action];
        const actionData = this._config.frames[this.action];

        actionData.img = getActionImage.img;

        this.animator.setAnimation(this.action, this.reflectSprite(actionData));
        await this.animator.update(timestamp);
    }

    protected getConfig(): SpriteActionList | null {
        if (this.type === 'player') {
            return configSpritePlayer;
        }

        if (this.type === 'enemy') {
            return configSpriteEnemies[this.name];
        }

        return null;
    }

    public reflectSprite(data: any): any {
        let temp = {
            y: this.y,
            scaleX: 0,
            scaleY: 1,
        };

        if (this.isFacingLeft) {
            data.x = -(this.x + (this.w));
            temp.scaleX = -1;
        } else {
            data.x = this.x;
            temp.scaleX = 1;
        }

        return {...data, ...temp};
    }

    public async updateAnimation(): Promise<any> {
        if (this.isDead) {
            this.action = 'death';
        }

        if (!(this.isMovingLeft || this.isMovingRight) && !this.isJump && !this.isFall && !this.isDead) {
            this.isIdle = true;
            this.action = 'idle';
        }

        if ((this.isMovingLeft || this.isMovingRight) && !this.isDead) {
            if (this.type === 'enemy') {
                this.action = 'walk';
            } else {
                this.action = 'run';
            }
        }

        if (this.isHurt && !this.isDead) {
            this.action = 'hurt';
        }

        if (this.isJump && !this.isDead) {
            this.action = 'jump';
        }

        if (this.isFall) {
            if (this.type === 'enemy') {
                this.action = 'idle';
            } else {
                this.action = 'fall';
            }
        }

        if (this.isAttack && !this.isDead && !this.isHurt) {
            this.action = 'attack';
        }
    }

    public setInstanceAnimation(): void {
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

    protected adjustVerticalMovement(dt: number): void {
        this.fall(dt);
    }

    protected adjustHorizontalMovement(dt: number): void {
        if (!this.isDead) {
            if (this.isMovingLeft && !this.isAttack) {
                this.x -= (this.speed * this.speedMultiplier) * dt;
            }

            if (this.isMovingRight && !this.isAttack) {
                this.x += (this.speed * this.speedMultiplier) * dt;
            }
        }
    }

    public fall(dt: number): void {
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

    public async attack(entities: GameObject[]): Promise<void> {
        const {w: w, h: h} = await this.getConfig();

        let startX: number;
        let endX: number;

        this.isAttack = true;

        if (!this.isFacingLeft) {
            startX = this.x + this.w / 2;
            endX = this.x + w;
        } else {
            startX = (this.x + this.w) - this.w / 2;
            endX = (this.x + this.w) - w;
        }

        for (const entity: Character of entities) {
            const {x: x, y: y, width: w, height: h} = entity;

            // если противник находится в диапазоне атаки справа или слева
            // добавить условие по y
            if ((entity.x >= startX && entity.x <= endX) ||
                (entity.x + entity.w >= endX && entity.x <= startX)
            ) {
                if (entity instanceof Character) {
                    this._library.sounds().swordAttack.play();
                    entity.getHurt(this.damage);
                }

            }
        }

        this._library.sounds().swordMiss.play();
    }

    dead(): void {
        this.isDead = true;
        this._bus.publish('game:filterColliders');
    }

    getHurt(damage: number): void {
        if (damage >= this.health) {
            this.health = 0;
            this.dead();
            return;
        }

        this.isHurt = true;
        this.health -= damage;
    }

    jump(): void {
        this._library.sounds().jump.play();

        this.jumpQuantity++;

        if (this.jumpQuantity >= this.maxJumpQuantity) {
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