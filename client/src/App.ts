import EventBus from "./EventBus";

export default class App {
    private _bus: EventBus;

    constructor() {
        this.init();
    }

    public init() {
        this._bus = new EventBus;

        this._bus.subscribe('test-event', function (data: any) {
            console.log('1 вызов, данные:', data);
        });

        this._bus.subscribe('test-event', function (data: any) {
            console.log('2 вызов, данные:', data);
        });

        this._bus.subscribe('create', function (data: any) {
            console.log('3 вызов, данные:', data);
        });

        this._bus.publish('test-event', 'нихуя');
    }

    public start() {

    }

    public end() {

    }
}