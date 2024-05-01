import EventBus from "@/EventBus";
import {loadImage} from "@/utils/utils";

export default class UI {
    private _bus: EventBus;

    public constructor(bus: EventBus) {
        this._bus = bus;
        this.createStartMenu()
    }

    public init(): void {
        this.subscribeEvents();
    }

    private subscribeEvents(): void {
        const startGameButton: HTMLElement = document.querySelector('.start-game-button');

        startGameButton.addEventListener('click', (e) => {
            const mainScreenEl: HTMLElement = document.querySelector('.main-screen');
            const screenHeight = document.documentElement.clientHeight / 2;
            mainScreenEl.style.transform = 'scale(1.05)';

            document.querySelector('.upper-closing-side').style.height = screenHeight + 'px';
            document.querySelector('.bottom-closing-side').style.height = screenHeight + 'px';

            setTimeout(() => {
                mainScreenEl.style.display = 'none';
                document.querySelector('.upper-closing-side').style.height = 0;
                document.querySelector('.bottom-closing-side').style.height = 0;
                this._bus.publish('app:start')
            }, 1000);
        });
    }

    private async createStartMenu() {
        const path = await loadImage('assets/ui/buttons/play/72px/play01');
        document.querySelector('.main-screen__menu').innerHTML += `<img src="${path}" alt="Start button" class="start-game-button">`;
    }

    private hideStartMenu(): void {

    }

    public startGame(): void {

    }
}