import Character from "./Character";
import EventBus from "../EventBus";
import {IPlayer} from "../types/game";
import Canvas from "./Canvas";
import sprite from '@assets/sprites/sprites.json';
import {makeLogger} from "ts-loader/dist/logger";

export default class Player extends Character implements IPlayer {
    private _bus: EventBus;

    constructor(bus: EventBus, canvas: Canvas, x, y, w, h) {
        super(canvas);
        this._bus = bus;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.setDefaultAnimation();
    }

    public async update(timestamp): Promise<void> {
        const getPath = await this.getPathToSprite(); // path to sprite
        const spriteMap = sprite.frames['player-' + getPath.status]; // data sprite
        const modifiedSpriteMap = this.prepareSpriteMapData(spriteMap);

        this.animator.setPath(getPath, modifiedSpriteMap);
        this.animator.update(timestamp);

        // Логика свободного падения
        if (!this.onGround) {
            this.vy += this.gravity;
            this.y += this.vy;
            this.isJump = true;
        } else {
            this.isJump = false;
        }

        this.y += this.vy;
    }

    /*
    * Подумать над реализацией, персонаж выходит за пределы блока, резкое смещение при смене стороны взгляда.
    * Проработать смещение по xOffset.
    * */
    public prepareSpriteMapData(data: any): any {
        let temp = {
            y: this.y,
            scaleX: 0,
            scaleY: 1,
        };

        if (this.isFacingLeft) {
            data.x = -(this.x + (this.width));
            //test.xOffset = data.w;
            temp.scaleX = -1;
        } else {
            data.x = +this.x;
            //test.xOffset = 0;
            temp.scaleX = 1;
        }

        return {...data, ...temp};
    }
}