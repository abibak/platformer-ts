import EventBus from "@/EventBus";

export default class MouseController {
    private _bus: EventBus;
    public click: boolean = false;

    public constructor() {
        this._bus = EventBus.getInstance();
    }

    public handleMouseEventDown(e) {
        this.click = true;
        this._bus.publish('player:attack');
    }

    public handleMouseEventUp(e) {
        this.click = false;
    }

    public toggleStateClick(value: boolean): void {
        this.click = value;
    }
}