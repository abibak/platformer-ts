import ChunkGenerator from "@/objects/world/ChunkGenerators/ChunkGenerator";
import Chunk from "@/objects/world/Chunk";
import Library from "@/library/Library";
import Canvas from "@/objects/Canvas";

export default class VillageGenerator extends ChunkGenerator {
    public constructor(canvas: Canvas, library: Library) {
        super(canvas, library);
    }

    public generate(chunk: Chunk) {
        //console.log(chunk)
    }
}