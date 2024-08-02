import {Subscriber} from "@/types/main";
import {Callback} from "@/types/main";

export default class EventBus {
    private _id: number = 0;
    private _subscribes: Subscriber = {};

    public subscribe(eventType: string, callback: Callback) {
        if (!this._subscribes[eventType]) {
            this._subscribes[eventType] = {};
        }
        this._subscribes[eventType][this.generateId()] = callback;
    }

    public async publish(eventType: string, data?: any): Promise<void> {
        if (!this._subscribes[eventType]) {
            return;
        }

        await Object.keys(this._subscribes[eventType]).forEach(id => {
            this._subscribes[eventType][id](data);
        });
    }

    public unsubscribe(eventType: string) {
        // delete this._subscribes[eventType];
    }

    private generateId(): number {
        return this._id += 1;
    }
}