import Chunk from "@/objects/world/Chunk";
import Canvas from "@/objects/Canvas";
import Library from "@/library/Library";

export default abstract class ChunkGenerator {
     protected _canvas: Canvas;
     protected _library: Library;

     protected constructor(canvas: Canvas, library: Library) {
          this._canvas = canvas;
          this._library = library;
     }

     abstract generate(chunk: Chunk): void;
}