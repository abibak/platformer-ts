import Character from "@/objects/characters/Character";
import GameObject from "@/objects/world/GameObject";

type CollisionInfo = {
    dirX: string | null;
    dirY: string | null;
}

export default class Collision {
    public detectCollision(obj: Character, other: GameObject): CollisionInfo | null {
        const dx: number = obj.centerX() - other.centerX();
        const dy: number = obj.centerY() - other.centerY();

        const width: number = (obj.w / 2) + (other.w / 2);
        const height: number = (obj.h / 2) + (other.h / 2);

        const collisionX: number = Math.abs(dx) - width;
        const collisionY: number = Math.abs(dy) - height;

        let dirX: string | null = null;
        let dirY: string | null = null;

        if (collisionX <= 0 && collisionY <= 0) {
            if (collisionY > collisionX) {
                // detect collision Y
                dirY = (dy > 0) ? 'top' : 'bottom';
            } else {
                // detect collision X
                dirX = (dx > 0) ? 'right' : 'left';
            }

            return { dirX, dirY }
        }

        return null;
    }

    public resolveCollision(obj: Character, other: GameObject, collisionInfo: CollisionInfo): void {
        if (collisionInfo.dirY) {
            if (collisionInfo.dirY === 'top') {
                // top
                obj.y = other.bottom();
            } else {
                // bottom
                obj.y = other.top() - obj.h;
                obj.onGround = true;
            }
        } else if (collisionInfo.dirX) {
            if (collisionInfo.dirX === 'right') {
                // right side
                obj.x = other.right();
            } else {
                // left side
                obj.x = other.left() - obj.w;
            }
        }
    }
}