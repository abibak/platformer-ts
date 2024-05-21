import EventBus from "@/EventBus";
import UIElement from "@/ui/UIElement";
import Button from "@/ui/buttons/Button";
import Canvas from "@/objects/Canvas";
import {loadImage} from "@/utils/utils";

export default class UI {
    private readonly _bus: EventBus;
    private readonly _canvas: Canvas;

    public elements: UIElement[] = [];

    public constructor(bus: EventBus, canvas: Canvas) {
        this._bus = bus;
        this._canvas = canvas;

        this.elements.push(new Button(
            this._canvas,
            200,
            200,
            100,
            40,
            'assets/ui/buttons/play/72px/play01',
        ));

        this.createStartMenu().then(() => this.init());
    }

    public init(): void {
        this.subscribeEvents();
    }

    private subscribeEvents(): void {
        const startGameButton: HTMLElement = document.querySelector('.start-game-button');
        const mainScreenEl: HTMLElement = document.querySelector('.main-screen');
        const screenHeight = document.documentElement.clientHeight / 2;

        startGameButton.addEventListener('click', (e) => {
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
        const url = await loadImage('assets/ui/buttons/play/72px/play01');
        document.querySelector('.main-screen__menu').innerHTML += `<img src="${url}" alt="Start button" class="start-game-button">`;
    }

    private hideStartMenu(): void {

    }

    public startGame(): void {

    }

    public update(): void {
        
    }
}