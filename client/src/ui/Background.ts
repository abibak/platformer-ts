import UIElement from "@/ui/UIElement";

export default class Background extends UIElement {
    public constructor(x: number, y: number, w: number, h: number, img: HTMLImageElement) {
        super(x, y, w, h, img);
        this.clickable = false;
    }

    public draw() {
        this.ctx.drawBackground(this.img);
    }
}