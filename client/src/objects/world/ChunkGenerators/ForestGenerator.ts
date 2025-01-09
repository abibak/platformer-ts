import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";
import Chunk from "@/objects/world/Chunk";
import Library from "@/library/Library";
import Canvas from "@/objects/Canvas";
import Tile from "@/objects/world/Tile";

export default class ForestGenerator extends ChunkGenerator {
    public constructor(canvas: Canvas, library: Library) {
        super(canvas, library);
    }

    public generate(chunk: Chunk) {
        let tile = new Tile(640, -598, 43, 22, true, this._library.images().grass1.image, this._canvas);
        tile.type = 1;
        chunk.objects.push(tile);
    }
}