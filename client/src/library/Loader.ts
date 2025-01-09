export default abstract class Loader {
    public async load(): Promise<void> {
        /*try {
            const {default: url} = await import('@/assets/' + this._path);
            this._url = url;
            this.img.src = url;
        } catch (e) {
            const imgName = this._path.split('/').pop();
            throw new Error(`Failed to load Image: "${imgName}"`);
        }*/
    }
}
