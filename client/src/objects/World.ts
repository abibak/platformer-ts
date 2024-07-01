import Canvas from "./Canvas";
import EventBus from "../EventBus";
import Enemy from "@/objects/Enemy";
import Brain from "@/objects/Brain";
import Player from "@/objects/Player";
import Library from "@/library/Library";
import {CharacterMap, StructureMap, Tile} from "@/types/main";
import ImageManager from "@/library/ImageManager";
import map from '../maps/map.json';
import Character from "@/objects/Character";
import enemies from "@/assets/data/enemies.json";

export default class World {
    private _library: Library;
    private _canvas: Canvas;
    private _bus: EventBus;
    private _brain: Brain;
    private _player: Player;
    private _tilemap: Tile[] = [];
    private _characters: Character[] = [];
    private _background: HTMLImageElement;
    private _mapJson: StructureMap;

    public level: number = 1;

    constructor(library: Library, canvas: Canvas, bus: EventBus, player: Player) {
        this._library = library;
        this._canvas = canvas;
        this._bus = bus;
        this._brain = new Brain(this._canvas, [player]);
        this._player = player;
        this._background = new Image();
        this._mapJson = map;

        Promise.all([this.processMap(), this.processEnemies()]).then(() => {
            this._bus.publish('world:generated', {
                map: this._tilemap,
                characters: this._characters,
            });
        });
    }

    public async update() {
        this.renderBackground();
        await this._brain.update();

        // отрисовка карты
        this._tilemap.forEach((tile: Tile) => {
            this._canvas.drawMap(tile);
        });
    }

    private renderBackground(): void {
        this._canvas.drawBackground(this._library.images().background.image);
    }

    private async processEnemies(): Promise<Enemy[]> {
        const level = map['level' + this.level]; // fix
        const characters: CharacterMap[] = level.objects;

        characters.forEach((obj: CharacterMap): void => {
            const config = enemies[obj.name];
            const enemy: Enemy = new Enemy(this._library, this._bus, this._canvas, {...config, x: obj.x, y: obj.y});
            enemy.id = obj.id;
            enemy.name = obj.name;
            enemy.movementPoints.startX = obj.x;
            enemy.movementPoints.startY = obj.y;
            enemy.movementPoints.length = 150; // movement (right | left) in px

            this._brain.bindEnemy(enemy);
            this._characters.push(enemy);
        });
    }

    public async processMap(): Promise<Tile[]> {
        const level = map['level' + this.level]; // fix
        const mapLevelsData: [] = level.data;

        const tile: Tile = {
            w: 64,
            h: 64,
            x: 0,
            y: 0,
            type: 'tile',
        };

        for (const level of mapLevelsData) {
            for (const tileNumber: number of level) {
                if (tileNumber === 0) {
                    tile.x += 64;
                    continue;
                }

                const img: ImageManager = this._library.tiles()['tile_' + tileNumber];

                this._tilemap.push({...tile, img: img.image});
                tile.x += 64;
            }

            tile.x = 0; // начало по x
            tile.y += 64; // начало по y
        }
    }
}