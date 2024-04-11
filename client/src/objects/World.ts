import map from '../maps/map.json';
import Canvas from "./Canvas";
import EventBus from "../EventBus";

/*
* Добавить логику импорта карты, в случае если карты нет
* */

export default class World {
    private _canvas: Canvas;
    private _bus: EventBus;

    public level = 1;
    public collisionObjects = [];

    private _background: HTMLImageElement = null;

    private _worldSize: {width: number, height: number} = {
        width: 0,
        height: 0
    }

    constructor(canvas: Canvas, bus: EventBus) {
        this._canvas = canvas;
        this._bus = bus;
        this._background = new Image();
    }

    private async renderBackground(): Promise<void> {
        if (this._background.src === '') {
            const path = await import('@assets/images/backgrounds/' + map['level' + this.level].background);
            this._background.src = path.default;
        }

        this._canvas.drawBackground(this._background);
    }

    public async generateMap() {
        const level = map['level' + this.level];
        const dataLevel = map['level' + this.level].data;
        const dataTextures = level.textures;
        let lineCount = 0;

        this.collisionObjects = [];

        let toDraw = {
            w: 0,
            h: 0,
            x: level.x,
            y: level.y,
        };

        const countKeys = Object.keys(dataTextures); // Количество нумераций текстур

        for (let i = 0; i < countKeys.length; i++) {
            if (countKeys[i] != "0") {
                let img: HTMLImageElement = dataTextures[countKeys[i]].image = new Image;
                let path = await import('@assets/textures/' + dataTextures[countKeys[i]].name);
                img.src = path.default;
            }
        }

        await this.renderBackground();

        let counter: number = 0;

        for (const data of dataLevel) {
            counter++;

            for (const value of data) {
                const currentTexture = dataTextures[value];

                if (counter === 1) {

                }

                // Нулевые объекты, вне коллайдера
                if (value === 0) {
                    toDraw.x += currentTexture.w;
                }

                // Объекты коллайдер
                if (value === 1 || value === 2 || value === 3) {
                    let textureImg = currentTexture.image;

                    toDraw.w = currentTexture.w;
                    toDraw.h = currentTexture.h;
                    toDraw.x += currentTexture.w;

                    this.setCollision(structuredClone(toDraw));

                    this._canvas.drawMap({...toDraw, img: textureImg});
                }
            }

            toDraw.x = level.x; // ширина следующего уровня, начиная с -64
            toDraw.y += level.h; // высота следующего уровня
            lineCount++; // подсчет уровней
        }

        this._bus.publish('map:generate', this.collisionObjects);
    }

    public setCollision(data: any) {
        this.collisionObjects.push(data);
    }
}