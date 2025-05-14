import Canvas from "../Canvas";
import EventBus from "../../EventBus";
import Brain from "@/objects/characters/Brain";
import Library from "@/library/Library";
import Chunk from "@/objects/world/Chunk";
import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";
import ForestGenerator from "@/objects/world/ChunkGenerators/ForestGenerator";
import VillageGenerator from "@/objects/world/ChunkGenerators/VillageGenerator";
import Player from "@/objects/characters/Player";
import {random} from '@/utils/utils';
import GameObjectsStore from "@/state/GameObjectsStore";
import Tile from "@/objects/world/Tile";

enum GeneratorTypes {
    Forest = 'forestGenerator',
    Village = 'villageGenerator',
}

export default class World {
    private _worldGenerated: boolean = false;
    private _width: number = 0; // number horizontal chunks
    private _height: number = 0; // number vertical chunks
    private _chunkSize: number = 10;
    private _chunks: Chunk[][] = [];
    private _renderChunks: Chunk[] = [];
    private _currentChunk: Chunk = null;
    private _player: Player;
    private _brain: Brain;
    private _gameObjectsStore: GameObjectsStore;
    private _chunkGenerators: { [key: string]: ChunkGenerator } = {};
    private _surfaceData: {
        width: number;
        height: number;
        move: number;
    } = {
        width: 3,
        height: 0,
        move: 0,
    }

    private readonly _library: Library;
    private readonly _canvas: Canvas;
    private readonly _bus: EventBus;

    public constructor(width: number, height: number, player: Player) {
        this._library = Library.getInstance();
        this._canvas = Canvas.getInstance();
        this._bus = EventBus.getInstance();
        this._gameObjectsStore = GameObjectsStore.getInstance();
        this._width = width;
        this._height = height;
        this._player = player;
        this._brain = new Brain([player]);
        this._surfaceData.height = this._chunkSize - 1;
        this._chunkGenerators['forestGenerator'] = new ForestGenerator();
        this._chunkGenerators['villageGenerator'] = new VillageGenerator();

        this.generateWorld();
        this._bus.subscribe('world:render', this.render.bind(this));
    }

    public async update(timestamp: number): Promise<void> {
        if (this._worldGenerated) {
            await this.getVisibleChunks();
            await this._brain.update();
            await this.render();

            for (const chunk of this._renderChunks) {
                await chunk.update(timestamp);
            }
        }
    }

    public async render(): Promise<void> {
        await this.renderBackground();
    }

    // нужно определить две переменные: renderX и renderY,
    // renderX - количество чанков для отрисовки по X,
    // renderY - количество чанков для отрисовки по Y
    private async getVisibleChunks(): Promise<void> {
        // вправо и влево от начального чанка, в котором находится персонаж
        const renderSize = 2;

        for (const subArr of this._chunks) {
            for (const chunk of subArr) {
                this._canvas.testDrawBorderChunk({
                    id: chunk.id,
                    x: chunk.data.x,
                    y: chunk.data.y,
                    w: chunk.data.size,
                    h: chunk.data.size,
                });

                const startX = chunk.data.x;
                const endX = chunk.data.x + chunk.data.size;

                const startY = chunk.data.y;
                const endY = chunk.data.y + chunk.data.size;

                const rendererChunks: Chunk[] = [];
                let currentChunk: Chunk;

                if (
                    this._player.x >= startX &&
                    this._player.x <= endX &&
                    this._player.bottom() >= startY &&
                    this._player.top() <= endY
                ) {
                    currentChunk = chunk;
                    this._currentChunk = chunk;
                }

                if (currentChunk) {
                    // чанки по y которые нужно рендерить
                    let rows = [];
                    let r = 0;
                    // начальные значения по Y
                    let tY = currentChunk.numberY;
                    let lY = currentChunk.numberY;

                    const currentLine = this._chunks[currentChunk.numberY];

                    rows.push(currentLine);

                    // получить все чанки по Y
                    while (r < renderSize) {
                        if (this._chunks[tY - 1]) {
                            tY -= 1;
                            let line: Chunk[] = this._chunks[tY];
                            rows.push(line);
                        }

                        if (this._chunks[lY + 1]) {
                            lY += 1;
                            let line: Chunk[] = this._chunks[lY];
                            rows.push(this._chunks[lY]);
                        }

                        r++;
                    }

                    for (const row of rows) {
                        rendererChunks.push(...this.getChunksInRange(row, renderSize, currentChunk.numberX));
                    }

                    this._renderChunks = rendererChunks;
                }
            }
        }
    }

    private getChunksInRange(line: Chunk[], range: number, start: number): Chunk[] {
        let i = 0;
        let l = start;
        let r = start;

        let chunks = [];

        chunks.push(line[start]);

        while (i < range) {
            if (line[r + 1]) {
                let right = line[r += 1];
                chunks.push(right);
            }

            if (line[l - 1]) {
                let left = line[l -= 1];
                chunks.push(left);
            }

            i++;
        }

        return chunks;
    }

    private async renderBackground(): Promise<void> {
        this._canvas.drawBackground(this._library.images().background.img);
    }

    // private getChunk(id: number): Chunk | null {
    //     let foundChunkIndex: number = Math.ceil(id / this._width) - 1;
    //
    //     if (foundChunkIndex < 0 || foundChunkIndex > this._width - 1 || !this._chunks[foundChunkIndex]) {
    //         console.warn('chunk by ID not found');
    //         return null;
    //     }
    //
    //     return (this._chunks[foundChunkIndex].find((el: Chunk) => el.id === id)) || null;
    // }

    private createChunksArray(): void {
        let chunk: Chunk[] = [];

        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                let chunkGenerator: ChunkGenerator = null;

                if (y === 0) {
                    let chunkTypes: GeneratorTypes[] = Object.values(GeneratorTypes);
                    //let randomType: string = chunkTypes[random(chunkTypes.length - 1, 0)] + 'Generator';
                    //chunkGenerator = this._chunkGenerators[randomType];
                    chunkGenerator = this._chunkGenerators['forestGenerator'];
                }

                let newChunk: Chunk = new Chunk(x, y, chunkGenerator);

                chunk.push(newChunk);
            }

            this._chunks.push(chunk);
            chunk = [];
        }
    }

    // генерация поверхности
    private surfaceGeneration(chunk: Chunk) {
        /* height - устанавливать значение после получение чанка (this.chunkSize) */
        if (chunk === null) {
            return;
        }

        for (let tileX = 0; tileX < chunk.tiles.length; tileX++) {
            if (this._surfaceData.move >= this._surfaceData.width) {
                const next: number = random(1, 0);

                if (next == 1) {
                    if (this._surfaceData.height - 1 > 0) {
                        this._surfaceData.height--;
                    }
                }

                if (next == 0) {
                    if (this._surfaceData.height + 1 < this._chunkSize - 1) {
                        this._surfaceData.height++;
                    }
                }
                this._surfaceData.move = 0;
            }

            this._surfaceData.move++;

            chunk.tileRowData.push({
                indexRow: tileX,
                heightFilled: this._surfaceData.height,
            });

            for (let tileY = this._surfaceData.height; tileY >= 0; tileY--) {
                const tile = chunk.tiles[tileX][tileY];
                tile.type = 6;
                tile.collidable = true;
            }
        }

        chunk.handleFillSurface();

        this._surfaceData.move++;
    }

    private processGenerationChunk(): void {
        let surfaceGenerated: boolean = false;

        for (let y = 0; y < this._height; ++y) {
            for (let x = 0; x < this._width; x++) {
                const chunk = this._chunks[y][x];
                chunk.createTilesArray();

                if (!surfaceGenerated) {
                    this.surfaceGeneration(chunk);
                } else {
                    chunk.fillTiles();
                }

                chunk.runGenerator();
            }

            surfaceGenerated = true;
        }
    }

    public async generateWorld() {
        this.createChunksArray();
        this.processGenerationChunk();

        this._worldGenerated = true;

        console.log(this._chunks)
    }

    public get renderChunks(): Chunk[] {
        return this._renderChunks;
    }

    public get currentChunk(): Chunk {
        return this._currentChunk;
    }
}