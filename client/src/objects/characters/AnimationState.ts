type TypeMap = Map<string, () => boolean>;

export default class AnimationState {
	private _states: TypeMap = new Map();

	public constructor() {}

	public setState(state: string, condition: () => boolean) {
        this._states.set(state, condition);
	}

	public getStates(): TypeMap {
		return this._states;
	}
}
