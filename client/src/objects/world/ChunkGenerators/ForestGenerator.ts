import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";
import Chunk from "@/objects/world/Chunk";
import {random} from "@/utils/utils";
import Tile from "@/objects/world/Tile";
import {ForestTreeTypes} from "@/types/game";
import GameObject from "@/objects/world/GameObject";
import Game from "@/game/Game";

type AdditionalObject = {
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    xOffset: number;
}

export default class ForestGenerator extends ChunkGenerator {
    public constructor() {
        super();
    }

    public generate(chunk: Chunk) {
        this.trees(chunk);
    }

    // генерация деревьев в чанке
    private async trees(chunk: Chunk): Promise<void> {
        const filledTileIds: number[] = []; // заполненные индексы тайлов
        const tiles: Tile[][] = chunk.tiles;

        let seedTile: Tile | null = null;

        const forestTrees: ForestTreeTypes[] = Object.values(ForestTreeTypes);
        const randomTreeName: string = forestTrees[random(forestTrees.length - 1, 0)];
        const dataTree = this._library.getDataTree(randomTreeName);

        const maxTreesInChunk: number = Math.floor(chunk.data.size / dataTree.w); // макс кол-во деревьев в чанке
        const countTrees: number = random(maxTreesInChunk, maxTreesInChunk);

        for (let y = 0; y < countTrees; y++) {
            const randomIndex = random(9, 0);

            // проверка на пересечение индексов
            // пересекаются на межчанке (9 и 0) индексы
            if (filledTileIds.includes(randomIndex) ||
                filledTileIds.includes(randomIndex - 1) ||
                filledTileIds.includes(randomIndex + 1)
            ) {
                continue;
            }

            const listTiles: Tile[] = tiles[randomIndex];
            seedTile = listTiles[chunk.tileRowData[randomIndex].heightFilled];

            this.pushInChunksObjects(chunk, {
                x: seedTile.x,
                y: seedTile.y,
                w: dataTree.w,
                h: dataTree.h,
                xOffset: dataTree.xOffset,
                name: randomTreeName,
            });

            filledTileIds.push(randomIndex);
        }
    }

    private pushInChunksObjects(chunk: Chunk, additionalData: AdditionalObject): void {
        chunk.objects.push(new GameObject(
            additionalData.x - additionalData.xOffset,
            additionalData.y - additionalData.h,
            additionalData.w,
            additionalData.h,
            false,
            this._library.images()[additionalData.name + '_tree'].img)
        );
    }
}