import Library from "@/library/Library";
import UIElement from "@/ui/UIElement";
import EventBus from "@/EventBus";

export default abstract class Screen {
    protected bus: EventBus
    protected library: Library;
    private _uiComponents: UIElement[] = [];
    private _screenWidth: number = 0;
    private _screenHeight: number = 0;

    protected constructor() {
        this.bus = EventBus.getInstance();
        this.library = Library.getInstance();
        this._screenWidth = window.innerWidth;
        this._screenHeight = window.innerHeight;

        window.addEventListener('resize', this.resizeScreen);
    }

    private resizeScreen(): void {
        this._screenWidth = window.innerWidth;
        this._screenHeight = window.innerHeight;
    }

    public addUIComponent(uiComponent: UIElement): void {
        this._uiComponents.push(uiComponent);
    }

    public getUIComponents(): UIElement[] {
        return this._uiComponents;
    }

    abstract update(): void;
    abstract render(): void;
}