import Character from "@/objects/Character";
import {Tile} from "@/types/main";
import Enemy from "@/objects/Enemy";

export default class Collision {
    public static handle(entity: Character, collisionObj: Tile | Character, side: string = ''): void {
        if (entity instanceof Character) {
            if (this.setDirectionCollision(side) === 'y') {
                entity.collisionY = side;
            } else {
                entity.collisionX = side;
            }


            if (entity.type === 'player' && collisionObj.type === 'tile') {
                this.handlePlayerVsTileCollide(collisionObj as Tile);
            }

            if (entity.type === 'player' && collisionObj.type === 'enemy') {
                this.handlePlayerVsEnemyCollide(collisionObj as Enemy);
            }
        }
    }

    public static handlePlayerVsTileCollide(obj: Tile): void {

    }

    public static handlePlayerVsEnemyCollide(obj: Enemy): void {

    }

    private static setDirectionCollision(side: string): string {
        if (side === 'top' || side === 'bottom') {
            return 'y';
        }

        return 'x';
    }
}