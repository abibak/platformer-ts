import Character from "@/objects/Character";
import {AutomatedCharacter} from "@/types/main";
import Enemy from "@/objects/Enemy";
import Player from "@/objects/Player";

export default class Brain {
    private _characters: AutomatedCharacter[] = [];
    private _targets: Character[] = [];

    public constructor(public canvas, targets: Character[]) {
        this._targets = targets;
    }

    public bindEnemy(character: Character): void {
        this._characters.push({
            character,
            reachedLeftBorder: false,
            reachedRightBorder: false,
            targetSide: '',
        });
    }

    public async update(): Promise<void> {
        // processes
        this._characters.forEach((obj: AutomatedCharacter): void => {
            this.processTargetDetection(obj);

            if (!obj.target && !obj.character.isDead) {
                this.processMovement(obj);
            }
        });
    }

    private processTargetDetection(obj: AutomatedCharacter): void {
        const attacker: Character = obj.character;
        const range: number = 300; // temp
        const centerHorizontalPoint: number = attacker.x + (attacker.width / 2);
        const leftRange: number = centerHorizontalPoint - range;
        const rightRange: number = centerHorizontalPoint + range;

        if (obj.target) {

        }

        this._targets.forEach((target: Player): void => {
            const {x: x, y: y, width: w, height: h} = target;

            // если цель находится в диапазоне двух значений от центра объекта и если цель находится в диапазоне высоты объекта
            if ((x + w >= leftRange && x + w <= rightRange) &&
                (target.y + target.height) >= attacker.y && (target.y) <= (attacker.y + attacker.height)) {
                attacker.isMovingLeft = false;
                attacker.isMovingRight = false;
                obj.target = target;

                const lTempX: number = target.x + target.width;
                const rTempX: number = target.x - attacker.width;

                let rightDistance: number = attacker.x - rTempX;
                let leftDistance: number = attacker.x - lTempX;

                attacker.speedMultiplier = 3.5;

                if (attacker.isFacingLeft && attacker.isMovingLeft) {
                    attacker.stopMovingLeft();
                } else {
                    attacker.stopMovingRight();
                }

                // если цель по Х больше чем ширина leftRange, то считается правой стороной
                if (x + w >= leftRange + range) {
                    // правая сторона
                    obj.targetSide = 'right';

                    if (rightDistance <= 0) {
                        attacker.startMovingRight();
                    } else {
                        attacker.stopMovingRight();
                    }
                } else {
                    // левая сторона
                    obj.targetSide = 'left';
                    attacker.startMovingLeft();

                    if (leftDistance >= 0) {
                        attacker.startMovingLeft();
                    } else {
                        attacker.stopMovingLeft();
                    }
                }

                if (Math.abs(leftDistance) <= 0 || Math.abs(rightDistance) <= 0) {
                    if (attacker instanceof Enemy) {
                        if (!attacker.isAttack) {
                            attacker.attack(target);
                        }
                    }
                }

                return;
            }

            obj.target = null;
            obj.targetSide = '';
            attacker.speedMultiplier = 1;
            attacker.stopMovingRight();
            attacker.stopMovingLeft();
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

        if (!reachedRightBorder) {
            obj.startMovingRight();

            if (endMovingPointRight || !notCollisionRightSide) {
                item.reachedRightBorder = true;
                item.reachedLeftBorder = false;
                obj.stopMovingRight();
            }
        }

        if (!reachedLeftBorder && reachedRightBorder) {
            obj.startMovingLeft();

            if (endMovingPointLeft || !notCollisionLeftSide) {
                item.reachedLeftBorder = true;
                item.reachedRightBorder = false;
                obj.stopMovingLeft();
            }
        }
    }
}