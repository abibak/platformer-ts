import Canvas from "../Canvas";
import EventBus from "../../EventBus";
import Enemy from "@/objects/characters/Enemy";
import Brain from "@/objects/Brain";
import Library from "@/library/Library";
import {StructureMap} from "@/types/main";
import ImageManager from "@/library/ImageManager";
import map from '../../maps/map.json';
import enemies from "@/assets/data/enemies.json";
import Tile from "@/objects/world/Tile";
import Character from "@/objects/characters/Character";
import GameObject from "@/objects/GameObject";
import Chunk from "@/objects/world/Chunk";

export default class World {
    private _width: number = 0; // number horizontal chunks
    private _height: number = 0; // number vertical chunks
    private _chunkSize: number = 10;
    private _chunks: Chunk[][] = [];
    private _library: Library;
    private _canvas: Canvas;
    private _bus: EventBus;
    private _brain: Brain;
    //private _tilemap: Tile[] = [];
    //private _mapJson: StructureMap;

    public currentLevel: number = 1;

    public constructor(width: number, height: number, library: Library, canvas: Canvas, bus: EventBus, player: Character) {
        this._width = width;
        this._height = height;
        this._library = library;
        this._canvas = canvas;
        this._bus = bus;
        this._brain = new Brain(this._canvas, [player]);
        //this._mapJson = map;

        this.generateWorld();
    }

    public async update(timestamp: number): Promise<void> {
        await this.renderBackground();
        await this._brain.update();

        // отрисовка карты

        for (let chunkY = 0; chunkY < this._chunks.length; chunkY++) {
            for (let chunkX = 0; chunkX < this._chunks[chunkY].length; chunkX++) {
                const chunk: Chunk = this._chunks[chunkY][chunkX];

                for (let tileY = 0; tileY < chunk.tiles.length; tileY++) {
                    for (let tileX = 0; tileX < chunk.tiles[tileY].length; tileX++) {
                        const tile: Tile = chunk.tiles[tileY][tileX];
                        await tile.draw();
                    }

                }
            }

            // this._tilemap.forEach((tile: Tile): void => {
            //     tile.update(timestamp);
            //     tile.draw();
            // });
        }
    }

    private async renderBackground(): Promise<void> {
        this._canvas.drawBackground(this._library.images().background.image);
    }

    private getChunk(id: number): Chunk | null {
        let foundChunkIndex: number = Math.ceil(id / this._height) - 1;

        if (foundChunkIndex < 0 || foundChunkIndex > this._width - 1 || !this._chunks[foundChunkIndex]) {
            console.warn('chunk by ID not found');
            return null;
        }

        return (this._chunks[foundChunkIndex].find((el: Chunk) => el.id === id)) || null;
    }

    private createChunkArray(): void {
        let chunk: Chunk[] = [];

        for (let y = 0; y < this._width; y++) {
            for (let x = 0; x < this._height; x++) {
                chunk.push(new Chunk(x, y, this._library, this._canvas));
            }

            this._chunks.push(chunk);
            chunk = [];
        }
    }

    private generateChunkTiles() {
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                this._chunks[x][y].createTilesArray();
            }
        }
    }

    private fillChunks() {
        for (let x = 1; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                this._chunks[x][y].fillTiles();
            }
        }
    }

    private surfaceGeneration(): void {
        let move = 0;
        let width = 8;
        let height = this._chunkSize - 1;

        // генерация поверхности только для первых чанков по горизонтали
        // от цикла можно избавиться
        for (let x = 0; x < 1; x++) {
            for (let y = 0; y < this._height; y++) {
                const chunk: Chunk | null = this.getChunk(this._chunks[x][y].id);
                /* height - устанавливать значение после получение чанка (this.chunkSize) */

                if (chunk === null) {
                    return;
                }

                for (let tileX = 0; tileX < chunk.tiles.length; tileX++) {
                    if (move >= width) {
                        const next: number = this.random(1, 0);

                        if (next == 1) {
                            if (height - 1 > 0) {
                                height--;
                            }
                        }

                        if (next == 0) {
                            if (height + 1 < this._chunkSize - 1) {
                                height++;
                            }
                        }
                        move = 0;
                    }

                    move++;

                    for (let tileY = height; tileY >= 0; tileY--) {
                        chunk.tiles[tileX][tileY].type = 1;
                    }
                }
            }
        }

        move++;
    }

    public generateWorld(): void {
        this.createChunkArray();
        this.generateChunkTiles();
        this.surfaceGeneration();
        this.fillChunks();

        console.log(this._chunks)
    }

    private random(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /*private async generateWorld(): Promise<void> {
        await Promise.all([
            this.processMap().then((): void => {
                this.processEnemies();
            }),
        ]);
    }

    private async processEnemies(): Promise<void> {
        const level = map['level' + this.currentLevel]; // fix
        const characters: Character[] = level.objects;

        for (const obj of characters) {
            const config = enemies[obj.name]; // *дублирование конфигов
            const enemy: Enemy = new Enemy(this._library,
                this._bus,
                this._canvas,
                {
                    ...config,
                    x: obj.x,
                    y: obj.y
                }
            );

            enemy.name = obj.name;
            enemy.movementPoints.startX = obj.x;
            enemy.movementPoints.startY = obj.y;
            enemy.movementPoints.length = 150; // movement (right | left) in px

            await this._bus.publish('game:addGameEntity', enemy);
            this._brain.bindEnemy(enemy);
        }
    }

    private async processMap(): Promise<void> {
        const level = map['level' + this.currentLevel]; // fix
        const mapLevelsData: [] = level.data;

        const tileWidth: number = 64;
        const tileHeight: number = 64;
        let tileOffsetX: number = 0;
        let tileOffsetY: number = 0;

        for (const level of mapLevelsData) {
            for (const tileNumber of level) {
                if (tileNumber === 0) {
                    tileOffsetX += 64;
                    continue;
                }

                const img: ImageManager = this._library.tiles()['tile_' + tileNumber];

                const tileObject: GameObject = new Tile(
                    tileOffsetX,
                    tileOffsetY,
                    tileWidth,
                    tileHeight,
                    true,
                    1,
                    img.image,
                    this._canvas
                );

                this._tilemap.push(tileObject);
                await this._bus.publish('game:addGameEntity', tileObject);

                tileOffsetX += 64;
            }

            tileOffsetX = 0; // начало по x
            tileOffsetY += 64; // начало по y
        }
    }*/
}