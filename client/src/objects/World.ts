import map from '../maps/map.json';
import Canvas from "./Canvas";
import EventBus from "../EventBus";

export default class World {
    private _canvas: Canvas;
    private _bus: EventBus;

    public level = 1;
    public collisionObjects = [];

    constructor(canvas: Canvas, bus: EventBus) {
        this._canvas = canvas;
        this._bus = bus;
    }

    public async generateMap() {
        const level = map['level' + this.level];
        const dataLevel = map['level' + this.level].data;
        const dataTextures = level.textures;
        let lineCount = 0;

        this.collisionObjects = [];

        let toDraw = {
            w: level.w,
            h: level.h,
            x: level.x,
            y: level.y,
        };

        const countKeys = Object.keys(dataTextures); // Количество разных блоков

        for (let i = 0; i < countKeys.length; i++) {
            let img: HTMLImageElement = dataTextures[countKeys[i]].image = new Image;
            let path = await import('@assets/textures/' + dataTextures[countKeys[i]].name);
            img.src = path.default;
        }

        for (const data of dataLevel) {
            for (const value of data) {
                if (value === 0) {
                    toDraw.w = level.w;
                    toDraw.x += level.w;
                    //continue;
                }

                const currentTexture = dataTextures[value];
                let textureImg = currentTexture.image;

                if (value === 1 || value === 2 || value === 3) {
                    if (value === 3) {
                        toDraw.w = 128;
                        toDraw.x += 128;
                    } else {
                        toDraw.w = currentTexture.w;
                        toDraw.x += currentTexture.w;
                    }
                }

                if (value !== 0) {
                    this.setCollision(structuredClone(toDraw));
                }

                this._canvas.drawMap({...toDraw, img: textureImg});
            }

            toDraw.x = level.x; // ширина следующего слоя
            toDraw.y += level.h; // высота следующего слоя
            lineCount++; // подсчет слоев
        }

        this._bus.publish('map:generate', this.collisionObjects);
    }

    public setCollision(data: any) {
        this.collisionObjects.push(data);
    }
}