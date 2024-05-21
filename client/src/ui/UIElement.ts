export default abstract class UIElement {
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;

    protected constructor(x: number, y: number, width: number, height: number) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        document.addEventListener('click', (e) => {
            console.log(e.pageY);
            console.log(this.isClicked(e.pageX, e.pageY));
        })
    }

    public isClicked(x: number, y: number): boolean {
        return x >= this._x && x <= this._x + this._width && y >= this._y && y <= this._y + this._height;
    }

    public abstract draw();
}