import Screen from "@/objects/screens/Screen";

export default class GameScreen extends Screen {
	public constructor() {
		super();
	}

	public async render() {
		//await this.bus.publish('world:render');
	}

	public async update(): Promise<void> {

	}
}