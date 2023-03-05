import { TILE_SIZE } from "./world.js";

const MOVE_COOLDOWN = 0.2;
const MAX_HEALTH = 100;
const BASE_DAMAGE = 10;

export class Player {
    constructor() {
        this.lastPressedHorizontal = false;
        this.moveTimer = 0;
        this.textureIndex = 0;
        this.isEnemy = false;
        this.damage = BASE_DAMAGE;
        this.health = MAX_HEALTH;
        this.shield = 0;
    }

    update = (input, world, particles, deltaTime) => {
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

        world.moveEntity(deltaX, deltaY, this, particles, true);
        world.updateEnemies(particles);
    }

    drawHealthbar = (renderer, x, y) => {
        renderer.drawRect(
            x,
            y,
            TILE_SIZE, 4,
            0, 0, 0,
        );
        renderer.drawRect(
            x + 1,
            y + 1,
            Math.floor(TILE_SIZE * (this.health / MAX_HEALTH)) - 2,
            2,
            255, 0, 0,
        );
    }

    heal = (amount) => {
        this.health += amount;

        if (this.health > MAX_HEALTH) {
            this.health = MAX_HEALTH;
        }
    }

    setDamage = (bonusDamage) => {
        this.damage = BASE_DAMAGE + bonusDamage;
    }

    setShield = (bonusShield) => {
        this.shield = bonusShield;
    }

    resetStats = () => {
        this.health = MAX_HEALTH;
        this.damage = BASE_DAMAGE;
        this.shield = 0;
    }
}