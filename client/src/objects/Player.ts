import Character from "./Character";
import EventBus from "../EventBus";
import {IPlayer} from "@/types/game";
import Canvas from "./Canvas";
import sprite from '@/assets/sprites/sprites.json';

export default class Player extends Character implements IPlayer {
    private _bus: EventBus;

    constructor(bus: EventBus, canvas: Canvas, x, y, w, h) {
        super(canvas);
        this._bus = bus;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.oldY = this.y;
        this.setDefaultAnimation();
    }

    public async update(timestamp): Promise<void> {
        const getPath = await this.getPathToSprite(); // path to sprite
        const spriteMap = sprite.frames['player-' + getPath.status]; // data sprite
        const modifiedSpriteMap = this.prepareSpriteMapData(spriteMap);

        this.animator.setPath(getPath, modifiedSpriteMap);
        await this.animator.update(timestamp);

        if (this.animator.finish) {
            if (getPath.status === 'attack') {
                this._bus.publish('toggleStateClick', false);
            }
        }

        // Cвободное падения
        if (!this.onGround) {
            this.vy += this.gravity;
            this.y += this.vy;
        } else {
            this.jumpQuantity = 0;
            this.isJump = false;
            this.isFall = false;
        }

        this.oldY = this.y;
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
}