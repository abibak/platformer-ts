import Character from "@/objects/Character";

export default class Collider {
    public checkColliding(character: Character, obj: any): boolean | void {
        let dY: number = (character.y + (character.height / 2)) - (obj.y + (obj.h / 2));
        let dX: number = (character.x + (character.width / 2)) - (obj.x + (obj.w / 2));

        let width: number = (character.width / 2) + (obj.w / 2);
        let height: number = (character.height / 2) + (obj.h / 2);

        // collision detected
        if (Math.abs(dY) <= height && Math.abs(dX) <= width) {
            let x: number = width - Math.abs(dX);
            let y: number = height - Math.abs(dY);

            if (x >= y) {
                if (dY > 0) {
                    character.y += height - Math.abs(dY); // top side
                } else {
                    character.y -= height - Math.abs(dY); // bottom side
                    character.onGround = true;
                }
            } else {
                if (dX <= 0) {
                    character.x -= width - Math.abs(dX); // right side
                } else {
                    character.x += width - Math.abs(dX); // left side
                }
            }

            return true;
        }
    }
}