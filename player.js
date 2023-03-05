const MOVE_COOLDOWN = 0.25;

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.moveTimer = 0;
    }

    update = (input, world, deltaTime) => {
        let deltaX = 0;
        let deltaY = 0;

        this.moveTimer -= deltaTime;

        if (input.isKeyPressed("KeyA")) {
            deltaX -= 1;
        }

        if (input.isKeyPressed("KeyD")) {
            deltaX += 1;
        }

        if (input.isKeyPressed("KeyW")) {
            deltaY -= 1;
        }

        if (input.isKeyPressed("KeyS")) {
            deltaY += 1;
        }

        if (deltaX == 0 && deltaY == 0) {
            this.moveTimer = 0;
            return;
        }

        if (this.moveTimer > 0) {
            return;
        }

        if (deltaX != 0 && deltaY != 0) {
            deltaX = 0;
        }

        this.moveTimer = MOVE_COOLDOWN;

        this.move(deltaX, deltaY, world);
    }

    move = (deltaX, deltaY, world) => {
        const dstX = this.x + deltaX;
        const dstY = this.y + deltaY;

        if (world.isOccupied(dstX, dstY)) {
            return;
        }

        world.removeEntity(this.x, this.y);
        this.x = dstX;
        this.y = dstY;
        world.addEntity(this.x, this.y, this);
    }
}