import Tile from "@/objects/world/Tile";
import Library from "@/library/Library";
import Canvas from "@/objects/Canvas";
import GameObjectsStore from "@/state/GameObjectsStore";
import GameObject from "@/objects/world/GameObject";
import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";
import {random} from "@/utils/utils";
import Enemy from "@/objects/characters/Enemy";
import {EnemyTypes} from "@/types/game";
import configEnemy from "@/assets/data/enemies.json";
import EventBus from "@/EventBus";
import Character from "../characters/Character";

type tileRowData = {
    indexRow: number;
    heightFilled: number;
}

type ChunkData = {
    x: number;
    y: number;
    size: number;
}

export default class Chunk {
    private readonly _id: number = 0;
    private static _staticId: number = 0;
    private _gameObjectStore: GameObjectsStore;
    private _bus: EventBus;
    private _generator: ChunkGenerator | null;
    private _tiles: Tile[][] = [];
    private _chunkSize: number = 10;
    private _numberX: number;
    private _numberY: number;
    private _library: Library;
    private _canvas: Canvas; // for test
    private _data: ChunkData = {
        x: 0,
        y: 0,
        size: 0
    }

    public tileRowData: tileRowData[] = [];
    public objects: GameObject[] = [];
    public entities: Character[] = [];
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
        this._bus = EventBus.getInstance();
    }

    public async update(timestamp: number) {
        await this.renderTiles();
        await this.renderObjects();

        for (const entity of this.entities) {
            if (entity.isUpdate) {
                await entity.update(timestamp);
            }
        }
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

        this.processEnemies();
    }

    private processEnemies(): void {
        const countEnemies = random(3, 1);
        const filledTiles = [];
        const enemyTypes: string[] = Object.values(EnemyTypes);

        let randomEnemyName: string = '';

        while (filledTiles.length < countEnemies) {
            const randomIndexCol: number = random(9, 0);
            const randomTilesCol = this._tiles[randomIndexCol];
            const topTile = randomTilesCol[this.tileRowData[randomIndexCol].heightFilled];

            if (filledTiles.includes(topTile.id)) {
                continue;
            }

            randomEnemyName = enemyTypes[random(enemyTypes.length - 1, 0)];

            const dataEnemy: any = configEnemy[randomEnemyName];
            const enemy: Enemy = new Enemy({
                ...dataEnemy,
                x: topTile.x,
                y: topTile.y - 200
            }, true);

            this.entities.push(enemy);

            //this._gameObjectStore.add(enemy)

            //this._bus.publish('game:addGameEntity', enemy);

            filledTiles.push(topTile.id);
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

    private async renderObjects(): Promise<void> {
        for (const obj of this.objects) {
            obj.draw();
        }
    }

    private async renderTiles(): Promise<void> {
        for (const tileRow of this._tiles) {
            for (const tile of tileRow) {
                await tile.draw();
            }
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