import GameObject from "@/objects/world/GameObject";

export default class GameObjectsStore {
    private static _instance: GameObjectsStore;
    private store: Map<number, GameObject> = new Map;

    private constructor() {

    }

    public static getInstance(): GameObjectsStore {
        if (!this._instance) {
            this._instance = new GameObjectsStore();
        }

        return this._instance;
    }

    public add<T extends GameObject>(obj: T): T {
        const proxyGameObject: T = new Proxy(obj, {
            set(target, prop, value) {
                if (value !== target[prop]) {
                    target[prop] = value;
                }
                return true;
            }
        });

        this.store.set(obj.id, proxyGameObject);

        return proxyGameObject;
    }
}