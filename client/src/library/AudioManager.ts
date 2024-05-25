export default class AudioManager {
    private context: HTMLAudioElement;
    private _dir: string = 'sounds/';
    public ended: boolean = false;

    public constructor(src: string, volume: number = 1) {
        import(/* webpackMode: "eager" */'@/assets/' + this._dir + src).then(url => {
            this.context = new Audio;
            this.context.src = url.default;
            this.context.volume = volume;

            this.events();
        });
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