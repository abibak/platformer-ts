import EventBus from "@/EventBus";

export default class SocketEventHandler {
    private _bus: EventBus;

    public constructor(bus: EventBus) {
        this._bus = bus;
    }

    public connection(data: any): void {
    }

    public disconnect(): void {

    }
}