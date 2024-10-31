import Canvas from "../Canvas";
import EventBus from "../../EventBus";
import Enemy from "@/objects/characters/Enemy";
import Brain from "@/objects/Brain";
import Library from "@/library/Library";
import {StructureMap} from "@/types/main";
import ImageManager from "@/library/ImageManager";
import map from '../../maps/map.json';
import enemies from "@/assets/data/enemies.json";
import {GameObject} from "@/types/game";
import Tile from "@/objects/world/Tile";
import Character from "@/objects/characters/Character";

export default class World {
    private _library: Library;
    private _canvas: Canvas;
    private _bus: EventBus;
    private _brain: Brain;
    private _tilemap: GameObject[] = [];
    private _mapJson: StructureMap;

    public currentLevel: number = 1;

    public constructor(library: Library, canvas: Canvas, bus: EventBus, player: Character) {
        this._library = library;
        this._canvas = canvas;
        this._bus = bus;
        this._brain = new Brain(this._canvas, [player]);
        this._mapJson = map;

        this.generateWorld();
    }

    public async update(timestamp: number): Promise<void> {
        await this.renderBackground();
        await this._brain.update();

        // отрисовка карты
        this._tilemap.forEach((tile: Tile): void => {
            tile.update(timestamp);
            tile.draw();
        });
    }

    private async renderBackground(): Promise<void> {
        this._canvas.drawBackground(this._library.images().background.image);
    }

    private async generateWorld(): Promise<void> {
        await Promise.all([
            this.processMap().then((): void => {
                this.processEnemies();
            }),
        ]);
    }

    private async processEnemies(): Promise<void> {
        const level = map['level' + this.currentLevel]; // fix
        const characters: Character[] = level.objects;

        for (const obj: Character of characters) {
            const config = enemies[obj.name]; // *дублирование конфигов
            const enemy: Enemy = new Enemy(this._library,
                this._bus,
                this._canvas,
                {
                    ...config,
                    x: obj.x,
                    y: obj.y
                }
            );

            enemy.name = obj.name;
            enemy.movementPoints.startX = obj.x;
            enemy.movementPoints.startY = obj.y;
            enemy.movementPoints.length = 150; // movement (right | left) in px

            await this._bus.publish('game:addGameEntity', enemy);
            this._brain.bindEnemy(enemy);
        }
    }

    private async processMap(): Promise<void> {
        const level = map['level' + this.currentLevel]; // fix
        const mapLevelsData: [] = level.data;

        const tile: GameObject = {
            w: 64,
            h: 64,
            x: 0,
            y: 0,
            type: 'wall',
            collidable: false,
        };

        for (const level of mapLevelsData) {
            for (const tileNumber: number of level) {
                if (tileNumber === 0) {
                    tile.x += 64;
                    continue;
                }

                const img: ImageManager = this._library.tiles()['tile_' + tileNumber];

                const tileObject: GameObject = new Tile(tile.x,
                    tile.y,
                    tile.w,
                    tile.h,
                    true,
                    'wall',
                    img.image,
                    this._canvas
                );

                this._tilemap.push(tileObject);
                await this._bus.publish('game:addGameEntity', tileObject);

                tile.x += 64;
            }

            tile.x = 0; // начало по x
            tile.y += 64; // начало по y
        }
    }
}