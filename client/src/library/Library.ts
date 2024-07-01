// Library - класс для загрузки всех ресурсов игры

// loadSounds и loadTiles должны добавлять элементы в общий массив промисов, что не формировать каждый массив
// дублирование кода - должен быть основной загрузчик (load) для ImageManager и AudioManager

// progress load - формируется на основе положительного результат выполнения промиса
// если промис отклонен, дальнейшая загрузка прерывается
// если totalLoaded равен needLoaded, считается, что загрузка заверешена на 100% (банально но, работает)


import ImageManager from "@/library/ImageManager";
import AudioManager from "@/library/AudioManager";
import {SoundEntity, Sounds} from "@/types/main";
import tilemap from "@/maps/map.json";
import Canvas from "@/objects/Canvas";
import EventBus from "@/EventBus";

type TileImage = { [key: string]: ImageManager }
type AllowPromises = AudioManager | ImageManager;

export default class Library implements Library {
    private _canvas: Canvas;
    private _bus: EventBus;
    private _totalLoaded: number = 0;
    private _needLoad: number = 0;
    private _loadError: boolean = false;

    private _sounds: Sounds;
    private _tiles: TileImage = {};
    private _images: TileImage = {};
    private _sprites;

    public constructor(canvas: Canvas, bus: EventBus) {
        this._canvas = canvas;
        this._bus = bus;

        this._images = {
            background: new ImageManager('images/backgrounds/background3.jpg'),
        }

        this._sprites = {
            player: {
                idle: new ImageManager('images/sprites/player/idle.png'),
                attack: new ImageManager('images/sprites/player/attack.png'),
                fall: new ImageManager('images/sprites/player/fall.png'),
                jump: new ImageManager('images/sprites/player/jump.png'),
                run: new ImageManager('images/sprites/player/run.png'),
                hurt: new ImageManager('images/sprites/player/hurt.png'),
            },
            'fire-warm': {
                idle: new ImageManager('images/sprites/enemies/fire-warm/idle.png'),
                attack: new ImageManager('images/sprites/enemies/fire-warm/attack.png'),
                death: new ImageManager('images/sprites/enemies/fire-warm/death.png'),
                walk: new ImageManager('images/sprites/enemies/fire-warm/walk.png'),
                hurt: new ImageManager('images/sprites/enemies/fire-warm/hurt.png')
            },
        }

        /*
        * дождаться успешного выполнения loadSounds и loadTiles
        * после вызвать init для подготовки промисов
        * в случае положительного результат, вызвать метод в App
        * */
        Promise.all([this.loadSounds(), this.loadTiles()]).then(() => {
            this.init().then(() => this._bus.publish('library:loaded'));
        });
    }

    public async init(): Promise<void> {
        // общий массив промисов
        const promises: AllowPromises[] = [];

        // вынести в метод загрузки спрайтов
        for (const key: string of Object.keys(this._sprites)) {
            for (const obj: ImageManager of Object.values(this._sprites[key])) {
                promises.push(obj)
            }
        }

        return new Promise(async (resolve, reject): Promise<void> => {
            // распределение промисов, для использования метода load
            promises.push(
                ...Object.values(this._tiles),
                ...Object.values(this._sounds.player),
                ...Object.values(this._sounds.world),
                this._images.background,
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

    /*
    * Тайлы импортируются динамически, используя номера тайла указанные в map.json
    * */
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

    public sprites() {
        return this._sprites;
    }
}