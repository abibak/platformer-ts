import GameObject from "@/objects/world/GameObject";

export default class GameObjectsStore {
    private store: Map<number, GameObject> = new Map;

    public constructor() {

    }

    public add<T extends GameObject>(obj: T): T {
        const proxyGameObject: T = new Proxy(obj, {
            set(target, prop, value) {
                if (value !== target[prop]) {
                    //console.log(prop, 'changed');
                    target[prop] = value;
                }
                return true;
            }
        });

        this.store.set(obj.id, proxyGameObject);
        return proxyGameObject;
    }
}