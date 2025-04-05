import Tile from "@/objects/world/Tile";
import ImageManager from "@/library/ImageManager";
import Library from "@/library/Library";
import Canvas from "@/objects/Canvas";
import GameObjectsStore from "@/state/GameObjectsStore";
import GameObject from "@/objects/world/GameObject";
import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";

export default class Chunk {
    private readonly _id: number = 0;
    private static _staticId: number = 0;
    private _gameObjectStore: GameObjectsStore;
    private _generator: ChunkGenerator | null;
    private _tiles: Tile[][] = [];
    private _chunkSize: number = 10;
    private _numberX: number;
    private _numberY: number;
    private _library: Library;
    private _canvas: Canvas; // for test
    private _data: {
        x: number;
        y: number;
        size: number;
    } = {
        x: 0,
        y: 0,
        size: 0
    }

    public tileRowData: {
        heightFilled: number;
        indexRow: number;
    }[] = [];

    public objects: GameObject[] = [];
    public type: string = 'default';

    public constructor(numberX: number, numberY: number, generator: ChunkGenerator) {
        Chunk._staticId += 1;
        this._id = Chunk._staticId;
        this._numberX = numberX;
        this._numberY = numberY;
        this._generator = generator;
        this._library = Library.getInstance();
        this._canvas = Canvas.getInstance();
        this._gameObjectStore = GameObjectsStore.getInstance();
    }

    public async update(timestamp: number) {
        await this.renderObjects();
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
                let tY = startChunkX + (tileY * 64);

                const img: ImageManager = this._library.tiles()['tile_' + 10]; // temp
                tileRaw[tileY] = this._gameObjectStore.add(
                    new Tile(tX, tY, 64, 64, false, img.img)
                );
            }

            if (this._numberY === 0) {
                this._tiles.push(tileRaw.reverse());
            } else {
                this._tiles.push(tileRaw);
            }

            tileRaw = [];
        }
    }

    public fillTiles(): void {
        for (let y = 0; y < this._tiles.length; y++) {
            for (let x = 0; x < this._tiles[y].length; x++) {
                this._tiles[y][x].type = 1;
                this._tiles[y][x].collidable = true;
            }
        }
    }

    public async renderObjects(): Promise<void> {
        for (const obj of this.objects) {
            obj.draw();
        }
    }

    public runGenerator(): void {
        if (this._generator) {
            this._generator.generate(this);
        }
    }

    public get id(): number {
        return this._id;
    }

    public get data(): { x: number; y: number; size: number } {
        return this._data;
    }

    public get tiles(): Tile[][] {
        return this._tiles;
    }

    public get numberX(): number {
        return this._numberX;
    }

    public get numberY(): number {
        return this._numberY;
    }
}