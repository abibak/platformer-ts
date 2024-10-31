import Character from "@/objects/characters/Character";
import Enemy from "@/objects/characters/Enemy";
import {GameObject} from "@/types/game";
import Tile from "@/objects/world/Tile";

export default class Collision {
    public static handle(entity: Character, collisionObj: GameObject, side: string | boolean): void {
        if (entity instanceof Character && typeof side === "string") {
            if (this.setDirectionCollision(side) === 'y') {
                entity.collisionY = side;
            } else {
                entity.collisionX = side;
            }

            if (entity.type === 'player' && collisionObj.type === 'tile') {
                this.handlePlayerVsTileCollide(collisionObj);
            }

            if (entity.type === 'player' && collisionObj.type === 'enemy') {
                this.handlePlayerVsEnemyCollide(collisionObj);
            }

            return;
        }

        entity.collisionX = '';
        entity.collisionY = '';
    }

    public static handlePlayerVsTileCollide(obj: GameObject): void {

    }

    public static handlePlayerVsEnemyCollide(obj: GameObject): void {

    }

    private static setDirectionCollision(side: string): string {
        if (side === 'top' || side === 'bottom') {
            return 'y';
        }

        return 'x';
    }
}