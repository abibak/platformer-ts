import map from '../maps/map.json';
import Canvas from "./Canvas";
import EventBus from "../EventBus";
import Enemy from "@/objects/Enemy";

/*
* Добавить логику импорта карты, в случае если карты нет
* */

export default class World {
    private _canvas: Canvas;
    private _bus: EventBus;

    public level = 1;
    public collisionObjects = [];

    private _background: HTMLImageElement = null;

    constructor(canvas: Canvas, bus: EventBus) {
        this._canvas = canvas;
        this._bus = bus;
        this._background = new Image();
        this.processEnemies();
    }

    private async renderBackground(): Promise<void> {
        if (this._background.src === '') {
            const {default: path} = await import(/* webpackMode: "eager" */ '@/assets/images/backgrounds/' + map['level' + this.level].background);
            this._background.src = path;
        }

        this._canvas.drawBackground(this._background);
    }

    private processEnemies() {
        const level = map['level' + this.level];
        const objects = level.objects;

        const enemies = [];

        objects.forEach(object => {
            enemies.push(new Enemy(this._bus, this._canvas, object.x, object.y, 50, 44));
        });

        this._bus.publish('setEnemies', enemies);
    }

    public async processMap(): Promise<void> {
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

        const countKeys = Object.keys(dataTextures); // Все используемые номера текстур

        for (let i = 0; i < countKeys.length; i++) {
            if (countKeys[i] != "0") {
                let img: HTMLImageElement = dataTextures[countKeys[i]].image = new Image;
                let {default: path} = await import(/* webpackMode: "eager" */ '@/assets/textures/' + dataTextures[countKeys[i]].name);
                img.src = path;
            }
        }

        await this.renderBackground();

        for (const data of dataLevel) {
            for (const value of data) {
                const currentTexture = dataTextures[value];

                // Нулевые объекты, вне коллайдера
                if (value === 0) {
                    toDraw.x += currentTexture.w;
                    continue;
                }

                // Объекты коллайдер
                let textureImg = currentTexture.image;

                toDraw.w = currentTexture.w;
                toDraw.h = currentTexture.h;
                toDraw.x += currentTexture.w;

                this.setCollision(structuredClone(toDraw));

                this._canvas.drawMap({...toDraw, img: textureImg});

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