// Library - класс для загрузки всех ресурсов игры

// progress load - формируется на основе положительного результат выполнения промиса
// если промис отклонен, дальнейшая загрузка прерывается
// если totalLoaded равен needLoaded, считается, что загрузка заверешена на 100% (банально но, работает)


import ImageManager from "@/library/ImageManager";
import AudioManager from "@/library/AudioManager";
import {SoundEntity} from "@/types/main";
import tilemap from "@/maps/map.json";
import Canvas from "@/objects/Canvas";
import EventBus from "@/EventBus";

type Loaders = AudioManager | ImageManager;
type TileImage = { [key: string]: ImageManager }

export default class Library {
    private static library: Library;

    private _canvas: Canvas;
    private _bus: EventBus;

    private _totalLoaded: number = 0;
    private _needLoad: number = 0;
    private _loadError: boolean = false;

    private _sounds: SoundEntity;
    private _tiles: TileImage = {};
    private _images: TileImage = {};
    private _sprites = {};
    private _uiComponents = {};

    private _loaders: (ImageManager | AudioManager)[] = [];

    private constructor() {
        this._canvas = Canvas.getInstance();
        this._bus = EventBus.getInstance();

        this.prepare();
    }

    public static getInstance(): Library {
        if (!this.library) {
            this.library = new Library();
        }

        return this.library;
    }

    public async prepare(): Promise<void> {
        await Promise.all([
            this.prepareImages(),
            this.prepareSounds(),
            this.prepareTiles(),
            this.prepareUIComponents(),
            this.prepareSprites(),
            this.test()
        ]);

        this.loadAllResources();
    }

    public async test() {
        for (let i = 0; i < 1; i++) {
            this.addLoader(new AudioManager('world/light_ambience1.wav'))
        }
    }

    private async loadAllResources(): Promise<void> {
        const loadPromises: Promise<void>[] = this._loaders.map(loader => loader.load());
        const results: PromiseSettledResult<any>[] = await Promise.allSettled(loadPromises);

        this._needLoad = loadPromises.length;
        this._totalLoaded = (results.filter((result, index) => {
            if (result.status === 'fulfilled') {
                this.progress(index + 1);
                return true;
            }

            return false;
        })).length

        this._loadError = results.some(result => result.status === 'rejected');

        if (this._totalLoaded === this._needLoad && !this._loadError) {
            this._bus.publish('library:loaded');
        }
    }

    private async prepareUIComponents(): Promise<void> {
        this._uiComponents = {
            playButton: this.addLoader(new ImageManager('images/ui/start-menu/buttons/play/72px/play01.png')),
        }
    }

    private async prepareImages(): Promise<void> {
        this._images = {
            background: this.addLoader(new ImageManager('images/backgrounds/background3.jpg')),
            startMenu: this.addLoader(new ImageManager('images/backgrounds/start-menu-background.png')),
            grass1: this.addLoader(new ImageManager('images/sprites/w-elements/grass.png'))
        }
    }

    private async prepareSprites(): Promise<void> {
        this._sprites = {
            player: {
                idle: this.addLoader(new ImageManager('images/sprites/player/idle.png')),
                attack: this.addLoader(new ImageManager('images/sprites/player/attack.png')),
                fall: this.addLoader(new ImageManager('images/sprites/player/fall.png')),
                jump: this.addLoader(new ImageManager('images/sprites/player/jump.png')),
                run: this.addLoader(new ImageManager('images/sprites/player/run.png')),
                hurt: this.addLoader(new ImageManager('images/sprites/player/hurt.png')),
                death: this.addLoader(new ImageManager('images/sprites/player/death.png'))
            },
            fireWarm: {
                idle: this.addLoader(new ImageManager('images/sprites/enemies/fire-warm/idle.png')),
                attack: this.addLoader(new ImageManager('images/sprites/enemies/fire-warm/attack.png')),
                death: this.addLoader(new ImageManager('images/sprites/enemies/fire-warm/death.png')),
                walk: this.addLoader(new ImageManager('images/sprites/enemies/fire-warm/walk.png')),
                hurt: this.addLoader(new ImageManager('images/sprites/enemies/fire-warm/hurt.png'))
            },
        }
    }

    private async prepareSounds(): Promise<void> {
        this._sounds = {
            swordAttack: this.addLoader(new AudioManager('player/attack_sword1.mp3', 0.3)),
            swordMiss: this.addLoader(new AudioManager('player/sword_miss1.wav', 0.3)),
            jump: this.addLoader(new AudioManager('player/jump1.wav', 0.4)),
            run: this.addLoader(new AudioManager('player/run1.wav')),
            hit: this.addLoader(new AudioManager('player/attack_sword1.mp3')),
            lightAmbient1: this.addLoader(new AudioManager('world/light_ambience1.wav')),
            lightAmbient2: this.addLoader(new AudioManager('world/light_ambience2.wav')),
        }
    }

    /*
    * Тайлы импортируются динамически, используя номера тайла указанные в map.json
    * */
    private async prepareTiles(): Promise<void> {
        const keys: string[] = Object.keys(tilemap.level1.tiles);

        for (const key of keys) {
            if (key !== '0') {
                this._tiles['tile_' + key] = this.addLoader(new ImageManager('tiles/Tile_' + key + '.png'));
            }
        }
    }

    private addLoader<L extends Loaders>(loader: L): L {
        this._loaders.push(loader);
        return loader;
    }

    private progress(index): void {
        const progress: number = Math.round(index / this._needLoad * 100);
        this._canvas.drawProgressLoad(progress);
    }


    public sounds(): SoundEntity {
        return this._sounds;
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

    public uiComponents() {
        return this._uiComponents;
    }
}