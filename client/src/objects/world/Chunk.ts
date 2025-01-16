import Tile from "@/objects/world/Tile";
import ImageManager from "@/library/ImageManager";
import Library from "@/library/Library";
import Canvas from "@/objects/Canvas";

export default class Chunk {
    private readonly _id: number = 0;
    private static _staticId: number = 0;
    public objects: Tile[] = [];
    private _tiles: Tile[][] = [];
    private _chunkSize: number = 10;
    private _numberX: number;
    private _numberY: number;
    private _library: Library;
    private _canvas: Canvas;
    private _data: {
        x: number;
        y: number;
        size: number
    } = {
        x: 0,
        y: 0,
        size: 0
    }

    public type: string = 'default';

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

        let startChunkX = (this._numberY) * (this._chunkSize * 64); // initial Y
        let startChunkY = (this._numberX) * (this._chunkSize * 64); // initial X

        this._data.x = startChunkY;
        this._data.y = startChunkX;
        this._data.size = this._chunkSize * 64;

        for (let tileX = 0; tileX < this._chunkSize; tileX++) {
            for (let tileY = 0; tileY < this._chunkSize; tileY++) {
                let tX = (tileX * 64) + startChunkY;
                let tY = startChunkX - (tileY * 64);

                const img: ImageManager = this._library.tiles()['tile_' + 10]; // temp
                const tile: Tile = new Tile(tX, tY, 64, 64, false, img.img, this._canvas);

                tileRaw[tileY] = tile;
            }

            this._tiles.push(tileRaw);
            tileRaw = [];
        }
    }

    public fillTiles(): void {
        for (let x = 0; x < this._tiles.length; x++) {
            for (let y = 0; y < this._tiles[x].length; y++) {
                this._tiles[x][y].type = 1;
                this._tiles[x][y].collidable = true;
            }
        }
    }

    public get id(): number {
        return this._id;
    }

    public get data(): { x: number; y: number } {
        return this._data;
    }

    public get tiles(): Tile[][] {
        return this._tiles;
    }
}