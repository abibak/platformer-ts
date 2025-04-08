import GameObject from "@/objects/world/GameObject";
import GameObjectsStore from "@/state/GameObjectsStore";

export default class Tile extends GameObject {
    public name: string = '';
    public type = 0;

    public constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        collidable: boolean,
        img: HTMLImageElement,
    ) {
        super(x, y, w, h, collidable, img);
        this.id = GameObjectsStore.tileId;
        GameObjectsStore.incrementTileId();
    }

    public async update(timestamp: number) {

    }

    public async draw(): Promise<void> {
        /*if (this.tempType !== '') {
            this._canvas.testDrawTile(this);
        }*/

        if (this.type !== 0) {
            this._canvas.drawTile({
                x: this.x,
                y: this.y,
                w: this.w,
                h: this.h,
                img: this.img,
                type: this.type
            });
        }

    }
}