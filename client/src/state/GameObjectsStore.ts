import GameObject from "@/objects/world/GameObject";
import Character from "@/objects/characters/Character";

export default class GameObjectsStore {
    private static _instance: GameObjectsStore;
    private _gameObjects: Map<number, GameObject> = new Map;
    private _characters: Character[] = [];

    private static _tileId: number = 1;

    private constructor() {}

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

        if (obj instanceof Character) {
            this._characters.push(obj);
        } else {
            this._gameObjects.set(obj.id, proxyGameObject);
        }

        return proxyGameObject;
    }

    public get characters(): Character[] {
        return this._characters;
    }

    public static incrementTileId() {
        this._tileId += 1;
    }

    public static get tileId(): number {
        return this._tileId;
    }

    public set tileId(value: number) {
        //GameObjectsStore._tileId = value;
    }
}