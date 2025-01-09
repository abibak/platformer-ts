import Canvas from "@/objects/Canvas";
import EventBus from "@/EventBus";

export default abstract class UIElement {
    protected x: number;
    protected y: number;
    protected w: number;
    protected h: number;
    protected img: HTMLImageElement;
    protected ctx: Canvas;
    protected bus: EventBus;
    protected posX: string = '';
    protected posY: string = '';
    protected clickable: boolean = true;
    public isHover: boolean = false;
    public isClick: boolean = false;
    private _events: {event: string, action: string}[] = [];

    protected constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        img: HTMLImageElement,
        posX: string = '',
        posY: string = ''
    ) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
        this.posX = posX;
        this.posY = posY;
        this.ctx = Canvas.getInstance();
        this.bus = EventBus.getInstance();

        this.handlePosition();

        document.addEventListener('click', (e) => {
            if (this.checkHover(e.pageX, e.pageY) && this.clickable) {
                this.isClick = true;
                this.processEvents(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.clickable) {
                if (this.checkHover(e.pageX, e.pageY)) {
                    this.isHover = true;
                } else {
                    this.isHover = false;
                }
            }
        });
    }

    private processEvents(e: MouseEvent) {
        const typeEvent = e.type;

        for (const obj of this._events) {
            if (typeEvent === obj.event) {
                this.bus.publish(obj.action);
            }
        }
    }

    public update() {
        this.handlePosition();
    }

    private handlePosition() {
        if (this.posX === 'center' && this.posY === 'center') {
            this.positionCenter();
        } else if (this.posX === 'center' && this.posY === '') {
            this.positionHorizontalCenter();
        } else if (this.posX === '' && this.posY === 'center') {
            this.positionVerticalCenter();
        } else {
            return;
        }
    }

    private positionCenter() {
        this.x = (window.innerWidth / 2) - (this.w / 2);
        this.y = (window.innerHeight / 2) - (this.h / 2);
    }

    private positionHorizontalCenter() {
        console.log('hor center')
    }

    private positionVerticalCenter() {
        console.log('vert center')
    }

    public checkHover(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
    }

    public addEvent(event: string, action: string): void {
        this._events.push({
            event,
            action
        });

        console.log(this._events)
    }

    public abstract draw();
}