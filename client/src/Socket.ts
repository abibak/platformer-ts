import SocketEventHandler from "@/handlers/SocketEventHandler";
import EventBus from "@/EventBus";

export default class Socket {
    private readonly _bus: EventBus;
    private _connection = null;
    private _socketEventHandler: SocketEventHandler;

    constructor(bus: EventBus) {
        this._bus = bus;
        this._socketEventHandler = new SocketEventHandler(this._bus);
    }

    public async connection(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this._connection = new WebSocket(url);

            this._connection.onopen = (data: any) => {
                this.message();
                this._socketEventHandler.connection(data);
                resolve();
            };

            this._connection.onerror = (): void => {
                reject('WebSocket error connection.');
            }
        });
    }

    private message(): void {
        this._connection.onmessage = (e) => {
            const data = JSON.parse(e.data)

            if (data.event === 'connect_player') {
                this._bus.publish('socket:connected', {
                    id: data.id_connection
                });
            }
        }
    }

    public send(data: any): void {
        this._connection.send(data);
    }

    public close() {
        this._connection.close();
    }
}