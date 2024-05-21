import Character from "./Character";
import EventBus from "../EventBus";
import {IPlayer} from "@/types/game";
import Canvas from "./Canvas";
import sprite from '@/assets/data-sprites/sprites.json';

export default class Player extends Character implements IPlayer {
    private _bus: EventBus;

    public constructor
    (
        bus: EventBus,
        canvas: Canvas,
        id: number,
        x: number,
        y: number,
        w: number,
        h: number,
        health: number = 300,
        maxHealth: number = 300,
    ) {
        super(canvas);
        this.type = 'player';
        this._bus = bus;
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.health = health;
        this.maxHealth = maxHealth;
        this.oldY = this.y;
        this.setDefaultAnimation();
    }

    public async update(timestamp): Promise<void> {
        const getPath = await this.getPathToSprite(); // path to sprite
        const spriteMap = sprite.frames['player-' + getPath.status]; // data sprite
        const modifiedSpriteMap = this.prepareSpriteMapData(spriteMap);

        //this.adjustVerticalMovement();
        this.adjustHorizontalMovement();

        this.animator.setPath(getPath, modifiedSpriteMap);
        await this.animator.update(timestamp);

        if (this.animator.finish) {
            if (getPath.status === 'attack') {
                this._bus.publish('toggleClickState', false);
            }
        }

        this.fall();
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