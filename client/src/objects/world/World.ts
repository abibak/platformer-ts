import Canvas from "../Canvas";
import EventBus from "../../EventBus";
import Brain from "@/objects/characters/Brain";
import Library from "@/library/Library";
import Tile from "@/objects/world/Tile";
import Character from "@/objects/characters/Character";
import Chunk from "@/objects/world/Chunk";
import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";
import ForestGenerator from "@/objects/world/ChunkGenerators/ForestGenerator";
import VillageGenerator from "@/objects/world/ChunkGenerators/VillageGenerator";
import Player from "@/objects/characters/Player";

enum ChunkTypes {
    Forest = 'forest',
    Village = 'village'
}

export default class World {
    private _width: number = 0; // number horizontal chunks
    private _height: number = 0; // number vertical chunks
    private _chunkSize: number = 10;
    private _chunks: Chunk[][] = [];
    private _renderChunks: Chunk[] = [];
    private _visibleChunks: Chunk[] = [];
    private _library: Library;
    private _canvas: Canvas;
	private _player: Player;
    private _bus: EventBus;
    private _brain: Brain;
    private _chunkGenerators: { [key: string]: ChunkGenerator } = {};

    public constructor(width: number, height: number, library: Library, canvas: Canvas, bus: EventBus, player: Player) {
        this._width = width;
        this._height = height;
        this._library = library;
        this._canvas = canvas;
		this._player = player;
        this._bus = bus;
        this._brain = new Brain(this._canvas, [player]);

        this._chunkGenerators['forestGenerator'] = new ForestGenerator(canvas, library);
        this._chunkGenerators['villageGenerator'] = new VillageGenerator(canvas, library);

        this.generateWorld();
    }

    public async update(timestamp: number): Promise<void> {
        await this.renderBackground();
        await this._brain.update();
        await this.drawChunks();
		await this.getVisibleChunks();
    }

	private async getVisibleChunks() {
		const renderSize = 1;

		for (const subArr of this._chunks) {
			for (const chunk of subArr) {

				if (this._player.x >= chunk.data.x && this._player.y >= chunk.data.y) {

				}
			}
		}
	}

    private async renderBackground(): Promise<void> {
        this._canvas.drawBackground(this._library.images().background.img);
    }

    private getChunk(id: number): Chunk | null {
        let foundChunkIndex: number = Math.ceil(id / this._width) - 1;

        if (foundChunkIndex < 0 || foundChunkIndex > this._width - 1 || !this._chunks[foundChunkIndex]) {
            console.warn('chunk by ID not found');
            return null;
        }

        return (this._chunks[foundChunkIndex].find((el: Chunk) => el.id === id)) || null;
    }

    private createChunkArray(): void {
        let chunk: Chunk[] = [];

        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                let newChunk: Chunk = new Chunk(x, y, this._library, this._canvas);

                if (y === 0) {
                    let chunkTypes: ChunkTypes[] = Object.values(ChunkTypes);
                    let randomType: string = chunkTypes[this.random(chunkTypes.length - 1, 0)] + 'Generator';
                    let generator: ChunkGenerator = this._chunkGenerators[randomType];

                    generator.generate(newChunk);
                }

                chunk.push(newChunk);
            }
            this._chunks.push(chunk);
            chunk = [];
        }
    }

    // скрестить с функцией fillChunks
    private generateChunkTiles() {
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                this._chunks[y][x].createTilesArray();
                // после создания массива тайлов, сразу же заполнить его, для избежания дублирования кода
                // сделать заполнение сразу после y = 1
                // this._chunks[y][x].fillTiles();
            }
        }
    }

    private fillChunks(): void {
        for (let y = 1; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                this._chunks[y][x].fillTiles();
            }
        }
    }

    private surfaceGeneration(): void {
        let move = 0;
        let width = 3;
        let height = this._chunkSize - 1;

        // генерация поверхности только для первых чанков по горизонтали
        // от цикла можно избавиться
        for (let y = 0; y < 1; y++) {
            for (let x = 0; x < this._width; x++) {
                const chunk: Chunk | null = this.getChunk(this._chunks[y][x].id);

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
                        chunk.tiles[tileX][tileY].collidable = true;
                    }
                }
            }
        }

        move++;
    }

    // func name: pullingMapObjects?
    // скрестить с функцией drawChunks, абсолютно одинаковые функции
    private async publishMapObjects(): Promise<void> {
        for (let chunkY = 0; chunkY < this._height; chunkY++) {
            for (let chunkX = 0; chunkX < this._chunks[chunkY].length; chunkX++) {
                const chunk: Chunk = this._chunks[chunkY][chunkX];

                for (let tileY = 0; tileY < chunk.tiles.length; tileY++) {
                    for (let tileX = 0; tileX < chunk.tiles[tileY].length; tileX++) {
                        await this._bus.publish('game:addGameEntity', chunk.tiles[tileY][tileX]);
                    }
                }
            }
        }
    }

    private async drawChunks(): Promise<void> {
        // отрисовка чанков
        for (let chunkY = 0; chunkY < this._height; chunkY++) {
            for (let chunkX = 0; chunkX < this._chunks[chunkY].length; chunkX++) {
                const chunk: Chunk = this._chunks[chunkY][chunkX];

                for (let tileY = 0; tileY < chunk.tiles.length; tileY++) {
                    for (let tileX = 0; tileX < chunk.tiles[tileY].length; tileX++) {
                        const tile: Tile = chunk.tiles[tileY][tileX];
                        await tile.draw();
                    }
                }

                if (chunkY === 0) {
                    this.drawObjectsChunk(chunk.objects);
                }
            }
        }
    }

    private drawObjectsChunk(chunkObjects): void {
        //chunkObjects[0]?.draw();
    }

    public async generateWorld(): Promise<void> {
        this.createChunkArray();
        this.generateChunkTiles();
        this.surfaceGeneration();
        this.fillChunks();
        this.publishMapObjects();

        console.log(this._chunks)
    }

    private random(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}