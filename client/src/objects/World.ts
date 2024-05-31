import Canvas from "./Canvas";
import EventBus from "../EventBus";
import Enemy from "@/objects/Enemy";
import Brain from "@/objects/Brain";
import Player from "@/objects/Player";
import Library from "@/library/Library";
import {Tile} from "@/types/main";
import ImageManager from "@/library/ImageManager";
import map from '../maps/map.json';

export default class World {
    private _library: Library;
    private _canvas: Canvas;
    private _bus: EventBus;
    private _brain: Brain;
    private _player: Player;
    private _tilemap = [];
    private _background: HTMLImageElement;

    public level: number = 1;

    constructor(library: Library, canvas: Canvas, bus: EventBus, player: Player) {
        this._library = library;
        this._canvas = canvas;
        this._bus = bus;
        this._brain = new Brain;
        this._player = player;
        this._background = new Image();

        Promise.all([this.processMap(), this.processEnemies()]).then((result) => {
            this._bus.publish('world:generated', [...result[0], ...result[1]]);
        });
    }

    public async update() {
        this.renderBackground();

        // рисование карты
        for (const tile of this._tilemap) {
            this._canvas.drawMap(tile);
        }

        this._brain.update();
    }

    private renderBackground(): void {
        this._canvas.drawBackground(this._library.images().background.image);
    }

    private async processEnemies(): Promise<Enemy[]> {
        const level = map['level' + this.level]; // fix
        const characters = level.objects;

        const enemies: Enemy[] = [];

        characters.forEach(obj => {
            const enemy: Enemy = new Enemy(this._library, this._bus, this._canvas, obj.x, obj.y, 50, 44);
            enemy.name = obj.name;
            enemy.movementPoints.startX = obj.x;
            enemy.movementPoints.startY = obj.y;
            enemy.movementPoints.length = 300; // movement (right | left) in px

            this._brain.bindEnemy(enemy);
            enemies.push(enemy);
        });

        return enemies;
    }

    public async processMap(): Promise<Tile[]> {
        const level = map['level' + this.level]; // fix
        const mapLevelsData: [] = level.data;

        const layers: Tile[] = [];

        const tile: Tile = {
            w: 64,
            h: 64,
            x: 0,
            y: 0,
            type: 'tile',
        };

        for (const level of mapLevelsData) {
            for (const tileNumber of level) {
                if (tileNumber === 0) {
                    tile.x += 64;
                    continue;
                }

                const img: ImageManager = this._library.tiles()['tile_' + tileNumber];

                this._tilemap.push({...tile, img: img.image});
                layers.push(structuredClone(tile))

                tile.x += 64;
            }

            tile.x = 0; // начало по x
            tile.y += 64; // начало по y
        }

        return layers;
    }
}