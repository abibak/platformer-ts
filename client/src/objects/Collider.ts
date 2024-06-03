import Character from "@/objects/Character";

export default class Collider {
    public checkColliding(character: Character, obj: any): string | boolean {
        const w = (obj instanceof Character) ? obj.width : obj.w;
        const h = (obj instanceof Character) ? obj.height : obj.h;

        let dX: number = (character.x + (character.width / 2)) - (obj.x + (w / 2));
        let dY: number = (character.y + (character.height / 2)) - (obj.y + (h / 2));

        let width: number = (character.width / 2) + (w / 2);
        let height: number = (character.height / 2) + (h / 2);

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