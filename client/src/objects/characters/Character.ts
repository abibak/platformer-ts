import Entity from '../entities/Entity';
import { ICharacter } from '@/types/game';
import Animator from '../animators/Animator';
import Canvas from '../Canvas';
import EventBus from '@/EventBus';
import Library from '@/library/Library';
import { DataSprite, SpriteActionList } from '@/types/main';
import GameObject from '@/objects/world/GameObject';
import AnimationState from '@/objects/characters/AnimationState';
import Chunk from "@/objects/world/Chunk";
import Game from '@/game/Game';

export default class Character extends Entity implements ICharacter {
    public isIdle: boolean = false;
    public isWalk: boolean = false;
    public isFacingLeft: boolean = false;
    public isDead: boolean = false;
    public isAttack: boolean = false;
    public isHurt: boolean = false;
    public isJump: boolean = false;
    public isFall: boolean = false;
    public isMovingLeft: boolean = false;
    public isMovingRight: boolean = false;

    public onGround: boolean = false;
    public speed: number = 0;
    public health: number;
    public maxHealth: number;
    public damage: number;
    public speedMultiplier: number = 1;

    public jumpQuantity: number = 0;
    public maxJumpQuantity: number = 2;
    public jumpHeight: number = 10;
    public maxJumpHeight: number = 10;

    // для класса Brain
    public movementPoints: {
        length: number;
        startX: number;
        startY: number;
    } = {
            length: 0,
            startX: 0,
            startY: 0,
        };

    public visibleChunks: Chunk | Chunk[];

    public collisionX: string = '';
    public collisionY: string = '';

    public mode: 'debug' | 'default' = 'default';

    protected vy: number = 0;
    protected gravity: number = 0.6;

    protected animator: Animator;
    protected action: string = '';

    protected readonly _bus: EventBus;
    protected readonly _library: Library;
    protected readonly _canvas: Canvas;
    protected readonly _animationState: AnimationState;
    protected readonly _animations: string[] = [];

    protected _spriteConfig: SpriteActionList | null;

    public constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        collidable: boolean,
        type: string,
        animations: string[],
    ) {
        super(x, y, w, h, collidable);
        this._canvas = Canvas.getInstance();
        this._bus = EventBus.getInstance();
        this._library = Library.getInstance();
        this._animationState = new AnimationState();
        this._animations = animations;
        this.type = type;
        this.setAnimations();
        this._bus.subscribe(
            'animator:animationFinish',
            this.animationFinish.bind(this)
        );

        this.setInstanceAnimation();
    }

    private setAnimations(): void {
        const conditions = {
            idle: {
                condition: () => this.isIdle && !this.isAttack && !this.isJump && !this.isFall && !this.isDead,
                enemyCondition: () => this.isIdle && !this.isDead,
            },
            attack: {
                condition: () => this.isAttack && !this.isDead && !this.isHurt,
                enemyCondition: () => this.isAttack && !this.isDead && !this.isHurt,
            },
            hurt: {
                condition: () => this.isHurt,
                enemyCondition: () => this.isHurt && !this.isDead,
            },
            jump: {
                condition: () => this.isJump && !this.isAttack,
                enemyCondition: () => () => !this.isAttack,
            },
            fall: {
                condition: () => this.isFall && !this.isAttack,
                enemyCondition: () => this.isFall && !this.isAttack,
            },
            run: {
                condition: () => !this.isIdle && !this.isAttack && !this.isDead && !this.isJump && !this.isFall,
                enemyCondition: () => !this.isIdle && !this.isAttack && !this.isDead && !this.isFall,
            },
            walk: {
                condition: () => (this.isMovingLeft || this.isMovingRight) && !this.isDead,
                enemyCondition: () => (this.isMovingLeft || this.isMovingRight) && !this.isDead,
            },
            death: {
                condition: () => this.isDead,
                enemyCondition: () => this.isDead,
            }
        };

        for (const animation of this._animations) {
            const dataConditions = conditions[animation];

            if (this.type === 'player') {
                this._animationState.setState(animation, dataConditions.condition)
            } else {
                this._animationState.setState(animation, dataConditions.enemyCondition)
            }
        }
    }

    // вынести в отдельный класс Animation
    private animationFinish(animationName: string): void {
        if (animationName === 'attack') {
            this._library.sounds().swordMiss.finish();
            this._library.sounds().swordAttack.finish();
            this.isAttack = false;
            this._bus.publish('toggleClickState', this.isAttack);
        }

        if (animationName === 'death') {
            console.log('dead', this);
            this.isUpdate = false;
        }

        if (animationName === 'hurt') {
            this.isHurt = false;
        }
    }

    public async update(timestamp: number): Promise<void> {
        if (this.mode === 'default') {
            this.adjustVerticalMovement(Game.dt);
            this.adjustHorizontalMovement(Game.dt);
        }

        this.onGround = false;

        await this.updateAnimation(); // обработка состояние персонажа

        const getActionImage = this._library.sprites()[this.name][this.action];
        const actionData = this._spriteConfig.frames[this.action];
        actionData.img = getActionImage.img;

        this.animator.setAnimation(this.action, this.reflectSprite(actionData));
        await this.animator.update(timestamp);
    }

    public async updateAnimation(): Promise<any> {
        const states = this._animationState.getStates();

        for (let [state, condition] of states.entries()) {
            if (condition()) {
                this.action = state;
            }
        }
    }

    public reflectSprite(data: any): any {
        let temp = {
            y: this.y,
            scaleX: 0,
            scaleY: 1,
        };

        if (this.isFacingLeft) {
            data.x = -(this.x + this.w);
            temp.scaleX = -1;
        } else {
            data.x = this.x;
            temp.scaleX = 1;
        }

        return { ...data, ...temp };
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
            this.isIdle = !(this.isMovingLeft || this.isMovingRight);

            if (this.isMovingLeft && !this.isAttack) {
                this.x -= this.speed * this.speedMultiplier * dt;
            }

            if (this.isMovingRight && !this.isAttack) {
                this.x += this.speed * this.speedMultiplier * dt;
            }
        }
    }

    private isFalling() {
        this.isFall = this.y > this.oldY;
        this.oldY = this.y;
    }

    public fall(dt: number): void {
        // Cвободное падения
        if (!this.onGround) {
            this.vy += this.gravity;
            this.y += Math.ceil(this.vy);

        } else {
            this.jumpQuantity = 0;
            this.isJump = false;
            this.isFall = false;
            this.vy = 0;
        }

        this.isFalling();
    }

    public async attack(entities: Character[]): Promise<void> {
        const { w: w, h: h } = this._spriteConfig.frames['attack'];

        let startX: number = 0;
        let endX: number = 0;
        let startY: number = 0;
        let endY: number = 0;

        this.isAttack = true;

        if (!this.isFacingLeft) {
            startX = this.x + (w - w);
            endX = this.x + w;
        } else {
            startX = this.x - (w - w / 2);
            endX = this.x - w / 2;
        }

        startY = this.y;
        endY = this.y + h;

        for (const entity of entities) {
            // если сущность находится в диапазоне атаки
            if (
                ((entity.x >= startX && entity.x <= endX) || (entity.x + entity.w >= endX && entity.x <= startX)) &&
                (entity.y >= startY && entity.y + entity.h <= endY)
            ) {
                if (entity instanceof Entity) {
                    this._library.sounds().swordAttack.play();
                    entity.getHurt(this.damage, entity);
                }
            }
        }

        this._library.sounds().swordMiss.play();
    }

    dead(entity: Entity): void {
        this.isDead = true;
        this.isUpdate = false;
    }

    getHurt(damage: number, entity: Entity): void {
        if (damage >= this.health) {
            this.health = 0;
            this.dead(entity);
            return;
        }

        this.isHurt = true;
        this.health -= damage;
    }

    jump(): void {
        this._library.sounds().jump.play();

        this.jumpQuantity++;

        if (this.jumpQuantity >= this.maxJumpQuantity) {
            this.jumpHeight = 0.8 * this.jumpHeight;
        }

        if (this.jumpQuantity <= this.maxJumpQuantity) {
            this.vy = -this.jumpHeight;
            this.onGround = false;
            this.isJump = false;
            this.jumpHeight = this.maxJumpHeight;
        }
    }
}
