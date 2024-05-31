export default class ImageManager {
    private _url: string = '';
    private _path: string = '';
    private _image: HTMLImageElement;

    public constructor(path: string) {
        this._path = path;
        this._image = new Image;
    }

    public async load(): Promise<void> {
        return new Promise((resolve, reject) => {
            import(/* webpackMode: "eager" */ '@/assets/' + this._path).then(url => {
                this._url = url.default;
                this._image.src = url.default;
                resolve();
            }).catch(() => {
                reject('Image not found');
            });
        });
    }

    public get url(): string {
        return this._url;
    }

    public get image(): HTMLImageElement {
        return this._image;
    }
}