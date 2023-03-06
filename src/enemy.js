export const GOBLIN_ENEMY = {
    textureIndex: 1,
    damage: 10,
    health: 20,
    shield: 0,
};

export const GHOST_ENEMY = {
    textureIndex: 2,
    damage: 10,
    health: 20,
    shield: 5,
};

export const SNAKE_ENEMY = {
    textureIndex: 3,
    damage: 20,
    health: 30,
    shield: 0,
};

export const ENEMY_TYPES = [
    GOBLIN_ENEMY,
    GHOST_ENEMY,
    SNAKE_ENEMY,
];

export class Enemy {
    constructor(type) {
        this.textureIndex = type.textureIndex;
        this.isEnemy = true;
        this.damage = type.damage;
        this.health = type.health;
        this.shield = type.shield;
    }
}