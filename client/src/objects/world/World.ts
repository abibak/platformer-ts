import Canvas from "../Canvas";
import EventBus from "../../EventBus";
import Brain from "@/objects/characters/Brain";
import Library from "@/library/Library";
import Tile from "@/objects/world/Tile";
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

		this._bus.subscribe('world:render', this.render.bind(this));
	}

	public async render() {
		await this.renderBackground();
		await this.drawChunks();
		await this.getVisibleChunks();
	}

	public async update(timestamp: number): Promise<void> {
		await this._brain.update();
		await this.render();
	}

	// нужно определить две переменные: renderX и renderY,
	// renderX - количество чанков для отрисовки по X,
	// renderY - количество чанков для отрисовки по Y
	private async getVisibleChunks() {
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
				})

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

	private async drawChunks() {
		for (let chunk of this._renderChunks) {
			const tiles = chunk.tiles

			for (let subArr of tiles) {
				for (let tile of subArr) {
					await tile.draw();
				}
			}
		}
	}

	public async generateWorld() {
		this.createChunkArray();
		this.generateChunkTiles();
		this.surfaceGeneration();
		this.fillChunks();
		console.log(this._chunks)
	}

	private random(max: number, min: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}