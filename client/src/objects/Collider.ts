export default class Collider {
    public constructor() {

    }

    public async checkCollisionObjects(entity, collisionObject: any) {
        let dY: number = (entity.y + (entity.height / 2)) - (collisionObject.y + (collisionObject.h / 2));
        let dX: number = (entity.x + (entity.width / 2)) - (collisionObject.x + (collisionObject.w / 2));

        let width: number = (entity.width / 2) + (collisionObject.w / 2);
        let height: number = (entity.height / 2) + (collisionObject.h / 2);

        // detection collision all side
        if (Math.abs(dY) <= height && Math.abs(dX) <= width) {
            let x: number = width - Math.abs(dX);
            let y: number = height - Math.abs(dY);

            if (x >= y) {
                if (dY > 0) {
                    entity.y += height - Math.abs(dY); // top side
                } else {
                    entity.y -= height - Math.abs(dY); // bottom side
                    entity.onGround = true;
                }
            } else {
                if (dX <= 0) {
                    entity.x -= width - Math.abs(dX); // right side
                } else {
                    entity.x += width - Math.abs(dX); // left side
                }
            }
        }
    }
}