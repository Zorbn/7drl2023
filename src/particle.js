import { TILE_SIZE } from "./world.js";

export const SPARK_PARTICLE = {
    texY: 56,
    frames: 4,
};

export const FIREWORK_PARTICLE = {
    texY: 72,
    frames: 5,
};

const FRAME_TIME = 0.05;

export class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.frameTimer = 0;
        this.type = type;
    }

    update = (deltaTime) => {
        this.frameTimer += deltaTime;

        if (this.frameTimer > FRAME_TIME) {
            this.frameTimer -= FRAME_TIME;
            this.frame++;
        }

        return this.frame >= this.type.frames;
    }

    draw = (renderer, texture) => {
        renderer.drawSprite(
            this.x * TILE_SIZE,
            this.y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
            texture,
            this.frame * TILE_SIZE,
            this.type.texY,
        );
    }
}