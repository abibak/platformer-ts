import Character from "@/objects/Character";
import {AutomatedCharacter} from "@/types/main";

export default class Brain {
    private _characters: AutomatedCharacter[] = [];

    public bindEnemy(character: Character): void {
        this._characters.push({
            character,
            reachedLeftBorder: false,
            reachedRightBorder: false,
        });
    }

    public async update(): Promise<void> {
        // movement
        this._characters.forEach((obj: AutomatedCharacter): void => {
            this.processMovement(obj);
        });
    }

    private processMovement(item: AutomatedCharacter): void {
        const obj: Character = item.character;
        const {
            reachedLeftBorder: reachedLeftBorder,
            reachedRightBorder: reachedRightBorder
        } = item;

        const notCollisionRightSide: boolean = obj.collisionX !== 'right';
        const notCollisionLeftSide: boolean = obj.collisionX !== 'left';

        const endMovingPointLeft: boolean = obj.x <= obj.movementPoints.startX - obj.movementPoints.length;
        const endMovingPointRight: boolean = obj.x >= obj.movementPoints.startX + obj.movementPoints.length;

        // перемещение объекта без обнаружений припятствий
        if (!reachedLeftBorder && !reachedRightBorder) {
            if (!endMovingPointRight) {
                obj.x += obj.speed;
            } else {
                setTimeout(() => {
                    item.reachedRightBorder = true;
                }, 1000)
            }
        }

        if (!reachedLeftBorder && reachedRightBorder) {
            if (!endMovingPointLeft) {
                obj.x -= obj.speed;
            } else {
                setTimeout(() => {
                    item.reachedLeftBorder = false;
                    item.reachedRightBorder = false;
                }, 1000);
            }
        }
    }
}