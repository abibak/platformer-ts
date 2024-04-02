export default class MouseController {
    public click: boolean = false;

    public handleMouseEventDown(event) {
        this.click = true;
    }

    public handleMouseEventUp(event) {
        this.click = false;
    }
}