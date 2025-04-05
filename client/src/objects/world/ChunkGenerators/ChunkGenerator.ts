import Chunk from "@/objects/world/Chunk";
import Canvas from "@/objects/Canvas";
import Library from "@/library/Library";

export default abstract class ChunkGenerator {
     protected _canvas: Canvas;
     protected _library: Library;

     protected constructor() {
          this._canvas = Canvas.getInstance();
          this._library = Library.getInstance();
     }

     abstract generate(chunk: Chunk): void;
}