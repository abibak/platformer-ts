import Tile from "@/objects/world/Tile";
import Library from "@/library/Library";
import Canvas from "@/objects/Canvas";
import GameObjectsStore from "@/state/GameObjectsStore";
import GameObject from "@/objects/world/GameObject";
import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";

type tileRowData = {
    indexRow: number;
    heightFilled: number;
}

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

    public visible: boolean = false;

    public tileRowData: tileRowData[] = [];
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

                //const img: ImageManager = this._library.tiles()['tile_' + 10]; // temp
                const tile = new Tile(tX, tY, 64, 64, false, this._library.tilemap().img);
                tileRaw[tileY] = this._gameObjectStore.add(tile);
            }

            if (this._numberY === 0) {
                this._tiles.push(tileRaw.reverse());
            } else {
                this._tiles.push(tileRaw);
            }

            tileRaw = [];
        }
    }

    public handleFillSurface(): void {
        for (let y = 0; y < this._tiles.length; y++) {
            const topTile: Tile = this._tiles[y][this.tileRowData[y].heightFilled];

            for (let x = 0; x < this._tiles[y].length; x++) {
                //const tile: Tile = this._tiles[y][x];

                const currentTile: tileRowData = this.tileRowData[y];
                const nextTile: tileRowData = this.tileRowData[y + 1];
                const prevTile: tileRowData = this.tileRowData[y - 1];

                /* если одиночный тайл */
                if (prevTile && nextTile) {
                    if (prevTile.heightFilled < currentTile.heightFilled && nextTile.heightFilled < currentTile.heightFilled) {
                        topTile.type = 4;
                    }
                }

                // если предыдущего тайла нет (для первого чанка)
                if (!prevTile && this.numberX === 0) {
                    topTile.type = 1;
                }

                // если последующего тайла нет (для последнего чанка)
                if (!nextTile && this.numberX >= 4) {
                    topTile.type = 3;
                }

                // если предыдущая колонка тайлов меньше, чем текущая, то обозначить как открывающая
                if (prevTile && prevTile.heightFilled < currentTile.heightFilled) {
                    topTile.type = 1;
                } else {
                    topTile.type = 2;
                }

                // если следующая колонка тайлов меньше, чем текущая, то обозначить как закрывающая
                if (nextTile && nextTile.heightFilled < currentTile.heightFilled) {
                    topTile.type = 3;
                }
            }
        }
    }

    public fillTiles() {
        for (let y = 0; y < this._tiles.length; y++) {
            for (let x = 0; x < this._tiles[y].length; x++) {
                const tile: Tile = this._tiles[y][x];
                tile.type = 6;
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