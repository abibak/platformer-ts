export default class ImageManager {
    private _url: string = '';
    private _path: string = '';
    private _img: HTMLImageElement = new Image;

    public constructor(path: string) {
        this._path = path;
    }

    public async load(): Promise<void> {
        try {
            const {default: url} = await import('@/assets/' + this._path);
            this._url = url;
            this.img.src = url;
        } catch (e) {
            const imgName = this._path.split('/').pop();
            throw new Error(`Failed to load Image: "${imgName}"`);
        }
    }

    public get url(): string {
        return this._url;
    }

    public get img(): HTMLImageElement {
        return this._img;
    }
}