import UIElement from "@/ui/UIElement";

export default class Button extends UIElement {
    public constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        img: HTMLImageElement,
        posX: string = '',
        posY: string = ''
    ) {
        super(x, y, w, h, img, posX, posY);
    }

    public draw() {
        this.ctx.drawButton(this.img, this.x, this.y, this.w, this.h);
    }
}