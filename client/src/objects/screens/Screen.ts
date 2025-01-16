import Library from '@/library/Library';
import UIElement from '@/ui/UIElement';
import EventBus from '@/EventBus';
import Canvas from "@/objects/Canvas";

export default abstract class Screen {
	protected bus: EventBus;
	protected library: Library;
	private _uiComponents: UIElement[] = [];
	private _ctx: Canvas;
	public static screenWidth: number = 0;
	public static screenHeight: number = 0;

	protected constructor() {
		this.bus = EventBus.getInstance();
		this.library = Library.getInstance();
		this._ctx = Canvas.getInstance();
		Screen.screenWidth = window.innerWidth;
		Screen.screenHeight = window.innerHeight;

		window.addEventListener('resize', this.resizeScreen.bind(this));
	}

	private resizeScreen(e): void {
		const target = e.currentTarget;

		this._ctx.width = target.innerWidth;
		this._ctx.height = target.innerHeight;

		Screen.screenWidth = target.innerWidth;
		Screen.screenHeight = target.innerHeight;
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
