import Screen from "@/objects/screens/Screen";
import Button from "@/ui/Button";
import UIElement from "@/ui/UIElement";
import Background from "@/ui/Background";

enum MenuScreenEvents {
    StartGame,
}

export default class MenuScreen extends Screen {
    public constructor() {
        super();
        this.createBackground();
        this.createButtons();
    }

    public update(): void {

    }

    public render(): void {
        const uiComponents: UIElement[] = this.getUIComponents();

        /* стоит вынести компоненты в proxy объекты и реагировать на их состояние,
        /* чем постоянно обновлять их */
        for (const component of uiComponents) {
            component.update();
            component.draw();
        }
    }

    private createStartGameButton(): Button {
        return new Button(
            0,
            0,
            144,
            72,
            this.library.uiComponents().playButton.img,
            'center',
            'center'
        );
    }

    public createButtons(): void {
        const startGame = this.createStartGameButton();

        this.addUIComponent(
            startGame,
        );

        startGame.addEvent('click', 'game:init');
    }

    public createBackground() {
        this.addUIComponent(new Background(
            0,
            0,
            1920,
            1076,
            this.library.images().startMenu.img
        ));
    }
}