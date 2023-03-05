const MOVE_COOLDOWN = 0.2;

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lastPressedHorizontal = false;
        this.moveTimer = 0;
    }

    update = (input, world, deltaTime) => {
        let deltaX = input.getHorizontalAxis();
        let deltaY = input.getVerticalAxis();

        this.moveTimer -= deltaTime;

        // Track which direction the player last tried to move in.
        // This is used to decide which direction to move the player in
        // when the player tries to move diagonally, it feels more fluid
        // than arbitrarily limiting the player's movement on one direction.
        if (input.wasHorizontalKeyPressed()) {
            this.lastPressedHorizontal = true;
        }

        if (input.wasVerticalKeyPressed()) {
            this.lastPressedHorizontal = false;
        }

        if (deltaX == 0 && deltaY == 0) {
            this.moveTimer = 0;
            return;
        }

        if (this.moveTimer > 0) {
            return;
        }

        if (deltaX != 0 && deltaY != 0) {
            if (this.lastPressedHorizontal) {
                deltaY = 0;
            } else {
                deltaX = 0;
            }
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