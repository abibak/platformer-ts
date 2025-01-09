export default class AudioManager {
    public ended: boolean = false;

    private context: HTMLAudioElement;
    private _dir: string = 'sounds/';
    private _path: string = '';

    public constructor(path: string, volume: number = 1) {
        this.context = new Audio;
        this.context.volume = volume;
        this._path = path;
    }

    public async load(): Promise<void> {
        try {
            const {default: url} = await import('@/assets/' + this._dir + this._path);

            this.context.src = url;
            this.events();
        } catch (e) {
            throw new Error(`Failed to load Audio: ${e}`);
        }
    }

    private events(): void {
        this.context.addEventListener('ended', (e) => {
            this.ended = true;
        });
    }

    public reset(): void {
        this.context.currentTime = 0;
    }

    public play(): void {
        this.context.play();
        this.ended = false;
    }

    public replay(): void {
        this.reset();
        this.play();
    }

    public pause(): void {
        this.context.pause();
    }

    public finish(): void {
        this.ended = true;
        this.pause();
        this.reset();
    }
}