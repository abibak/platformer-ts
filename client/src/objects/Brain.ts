import Character from "@/objects/Character";

export default class Brain {
    private _objects: Character[] = [];

    public constructor() {

    }

    public bindEnemy(obj: Character): void {
        this._objects.push(obj);
    }

    public update(): void {
        // movement
        this.processMovement();
    }

    private processMovement(): void {
        // process
        this._objects.forEach((obj: Character) => {
            if (obj.type === 'enemy') {
                obj.x += 1;
            }
        });
    }
}