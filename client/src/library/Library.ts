// основной класс загрузки ресурсов игры

import ImageManager from "@/library/ImageManager";
import AudioManager from "@/library/AudioManager";
import {SoundEntity, Sounds} from "@/types/main";
import tilemap from "@/maps/map.json";
import Canvas from "@/objects/Canvas";
import EventBus from "@/EventBus";

type TileImage = { [key: string]: ImageManager }

export default class Library implements Library {
    private _canvas: Canvas;
    private _bus: EventBus;
    private _totalLoaded: number = 0;
    private _needLoad: number = 0;
    private _loadError: boolean = false;

    private _sounds: Sounds;
    private _tiles: TileImage = {};
    private _images: TileImage  = {};

    public constructor(canvas: Canvas, bus: EventBus) {
        this._canvas = canvas;
        this._bus = bus;

        this._images = {
            background: new ImageManager('images/backgrounds/background3.jpg'),
        }

        Promise.all([this.loadSounds(), this.loadTiles()]).then(() => {
            this.init().then(() => this._bus.publish('library:loaded'));
        });
    }

    public async init(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const promises: any[] = [];

            promises.push(
                ...Object.values(this._tiles),
                ...Object.values(this._sounds.player),
                this._images.background
            );

            this._needLoad = promises.length;

            for (const promise: (AudioManager | ImageManager) of promises) {
                if (this._loadError) {
                    break;
                }

                await promise.load().then((): void => {
                    this._totalLoaded++;
                    this.progress();
                }).catch(() => {
                    this._loadError = true;
                    reject();
                });
            }

            return this._totalLoaded === this._needLoad ? resolve() : reject();
        });
    }

    private progress(): void {
        const progress: number = Math.round(this._totalLoaded / this._needLoad * 100);
        this._canvas.drawProgressLoad(progress);
    }

    private async loadTiles(): Promise<void> {
        const keys: string[] = Object.keys(tilemap.level1.tiles);

        keys.forEach((key: string): void => {
            if (key !== '0') {
                this._tiles['tile_' + key] = new ImageManager('tiles/Tile_' + key + '.png');
            }
        });
    }

    private async loadSounds(): Promise<void> {
        this._sounds = {
            player: {
                jump: new AudioManager('player/jump1.wav', 0.4),
                attack: new AudioManager('player/attack_sword1.mp3'),
                run: new AudioManager('player/run1.wav'),
                hit: new AudioManager('player/attack_sword1.mp3'),
                'sword_miss': new AudioManager('player/sword_miss1.wav', 0.3),
            },
            enemies: {
                'fire-worm': {
                    jump: new AudioManager('player/jump1.wav', 0.4),
                }
            },
            world: {
                'light_ambient1': new AudioManager('world/light_ambience1.wav'),
                'light_ambient2': new AudioManager('world/light_ambience2.wav'),
            }
        }
    }

    public sounds(entity: string): SoundEntity {
        return this._sounds[entity];
    }

    public tiles(): TileImage {
        return this._tiles;
    }

    public images(): TileImage {
        return this._images;
    }
}