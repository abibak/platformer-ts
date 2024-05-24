export default class AudioManager {
    private context: HTMLAudioElement;

    public constructor(src: string, volume: number = 1) {
        import(/* webpackMode: "eager" */'@/assets/sounds/player/' + src).then(url => {
            this.context = new Audio;
            this.context.src = url.default;
            this.context.volume = volume;
        })

    }

    public reset(): void {
        this.context.currentTime = 0;
    }

    public play(): void {
        this.context.play();
    }

    public pause(): void {
        this.context.pause();
    }

    public finish(): void {
        this.pause();
        this.reset();
    }
}