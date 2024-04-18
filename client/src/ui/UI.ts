import EventBus from "@/EventBus";

export default class UI {
    private _bus: EventBus;

    public constructor(bus: EventBus) {
        this._bus = bus;
        this.createStartMenu();
    }

    private async createStartMenu() {
        const {default: btn} = await import('@/assets/ui/buttons/play/72px/play01.png');
        document.querySelector('.wrapper').innerHTML += `<img src="${btn}" alt="Start button" class="start-game-button">`;
    }

    private hideStartMenu(): void {

    }
}