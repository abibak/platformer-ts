export default class Socket {
    private _connection = null;

    constructor(url: string) {
        this._connection = new WebSocket(url);
        this._connection.onopen = () => {
            this.send('TEST MESSAGE');
        };

        this._connection.onmessage = (e) => {
            console.log(e);
        }
    }

    public send(data: any): void {
        this._connection.send(data);
    }

    public onopen(e) {

    }

    public close() {
        //
    }
}