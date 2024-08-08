import Character from "@/objects/Character";
import {GameObject} from "@/types/game";

export default class Collider {
    public checkColliding(character: Character, obj: GameObject): string | boolean {
        let dX: number = (character.x + (character.w / 2)) - (obj.x + (obj.w / 2));
        let dY: number = (character.y + (character.h / 2)) - (obj.y + (obj.h / 2));

        let width: number = (character.w / 2) + (obj.w / 2);
        let height: number = (character.h / 2) + (obj.h / 2);

        // collision detected
        if (Math.abs(dY) <= height && Math.abs(dX) <= width) {
            let x: number = width - Math.abs(dX);
            let y: number = height - Math.abs(dY);

            if (x >= y) {
                if (dY > 0) {
                    character.y += height - Math.abs(dY); // top side
                    return 'top';
                } else {
                    character.y -= height - Math.abs(dY); // bottom side
                    character.onGround = true;
                    return 'bottom';
                }
            } else {
                if (dX <= 0) {
                    character.x -= width - Math.abs(dX); // right side
                    return 'right';
                } else {
                    character.x += width - Math.abs(dX); // left side
                    return 'left';
                }
            }
        }

        return false;
    }
}