import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";
import Chunk from "@/objects/world/Chunk";
import GameObject from "@/objects/world/GameObject";
import {random} from "@/utils/utils";
import world from "@/assets/data/world.json";
import Tile from "@/objects/world/Tile";
import Game from "@/game/Game";

export default class ForestGenerator extends ChunkGenerator {
    public constructor() {
        super();
    }

    public generate(chunk: Chunk) {
        this.trees(chunk);
    }

    private trees(chunk: Chunk): void {
        const tiles = chunk.tiles;
        const countTrees: number = random(3, 2);

        let seedTile: Tile | null = null;

        for (let y = 0; y <= countTrees; y++) {
            const randomIndex = random(9, 0);
            const listTiles: Tile[] = tiles[randomIndex];

            seedTile = listTiles[chunk.tileRowData[randomIndex].heightFilled];
            chunk.objects.push(new GameObject(
                seedTile.x - 64,
                seedTile.y - world.tree1.h,
                world.tree1.w,
                world.tree1.h,
                false,
                this._library.images().tree1.img)
            );
        }
    }
}