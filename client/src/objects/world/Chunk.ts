import Tile from "@/objects/world/Tile";
import ImageManager from "@/library/ImageManager";
import Library from "@/library/Library";
import Canvas from "@/objects/Canvas";

export default class Chunk {
    private readonly _id: number = 0;
    private static _staticId: number = 0;
    private _tiles: Tile[][] = [];
    private _chunkSize: number = 10;
    private _numberX: number;
    private _numberY: number;
    private _library: Library;
    private _canvas: Canvas;

    public constructor(numberX: number, numberY: number, library: Library, canvas: Canvas) {
        Chunk._staticId += 1;
        this._id = Chunk._staticId;
        this._numberX = numberX;
        this._numberY = numberY;
        this._library = library;
        this._canvas = canvas;
    }

    public createTilesArray(): void {
        let tileRaw: Tile[] = [];

        //console.log(this._numberX)

        let x = (this._numberY) * this._chunkSize * 64;
        let y = (this._numberX + 1) * this._chunkSize * 64;

        for (let tileX = 0; tileX < this._chunkSize; tileX++) {
            for (let tileY = 0; tileY < this._chunkSize; tileY++) {

                let tX = (tileX * 64) + x;
                let tY = y - (tileY * 64);

                const img: ImageManager = this._library.tiles()['tile_' + 10];

                tileRaw[tileY] = new Tile(tX, tY, 64, 64, true, img.image, this._canvas);
            }

            this._tiles.push(tileRaw);
            tileRaw = [];
        }
    }

    public fillTiles(): void {
        for (let x = 0; x < this._tiles.length; x++) {
            for (let y = 0; y < this._tiles[x].length; y++) {
                this._tiles[x][y].type = 1;
            }
        }
    }

    public get id(): number {
        return this._id;
    }

    public get tiles(): Tile[][] {
        return this._tiles;
    }
}