import {Subscriber} from "@/types/main";
import {Callback} from "@/types/main";

export default class EventBus {
    private static _instance: EventBus;
    private _id: number = 0;
    private _subscribes: Subscriber = {};

    private constructor() {
        //
    }

    public static getInstance(): EventBus {
        if (!this._instance) {
           this._instance = new EventBus;
        }

        return this._instance;
    }

    public subscribe(eventType: string, callback: Callback): void {
        if (!this._subscribes[eventType]) {
            this._subscribes[eventType] = {};
        }

        this._subscribes[eventType][this.generateId()] = callback;
    }

    public async publish(eventType: string, data?: any): Promise<void> {
        if (!this._subscribes[eventType]) {
            return;
        }

        Object.keys(this._subscribes[eventType]).forEach(id => {
            return this._subscribes[eventType][id](data);
        });
    }

    public unsubscribe(eventType: string) {
        delete this._subscribes[eventType];
    }

    private generateId(): number {
        return this._id += 1;
    }
}