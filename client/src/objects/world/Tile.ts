import GameObject from "@/objects/world/GameObject";
import GameObjectsStore from "@/state/GameObjectsStore";

type TileTypes = 0 | 1;

export default class Tile extends GameObject {
    private _rendered: boolean = false;
    public type: TileTypes = 0;

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
        if (this.type === 1) {
            this._canvas.drawTile({
                x: this.x,
                y: this.y,
                w: this.w,
                h: this.h,
                img: this.img
            });

            this._rendered = true;
        }
    }
}