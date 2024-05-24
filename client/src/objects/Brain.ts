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
                let limitMovement: number = (obj.movementPoints.startX - obj.x) + obj.movementPoints.length;

                if (limitMovement >= obj.movementPoints.length) {
                    obj.startMovingRight();
                }

                // if (limitMovement <= 0) {
                //     obj.stopMovingRight();
                //
                //     setTimeout((): void => {
                //         obj.startMovingLeft();
                //     }, 1000)
                // }
            }
        });
    }
}