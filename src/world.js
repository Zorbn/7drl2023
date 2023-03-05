import { FIREWORK_PARTICLE, Particle, SPARK_PARTICLE } from "./particle.js";

export const TILE_SIZE = 16;
const SUBTILE_SIZE = 8;
const TILE_TEXTURE_WIDTH = SUBTILE_SIZE * 5;
const TILE_TEXTURE_CENTER_X = 1;
const TILE_TEXTURE_CENTER_Y = 1;
const TILE_TEXTURE_CORNER_X = 4;
const TILE_TEXTURE_CORNER_Y = 1;

const ROOM_SIZE_VARIANCE = 4;
const MIN_ROOM_SIZE = 2;
const ROOM_COUNT = 10;

export const STONE_FLOOR_TILE = {
    textureIndex: 0,
    isLight: false,
    isWalkable: true,
    isExit: false,
};

export const STONE_WALL_TILE = {
    textureIndex: 1,
    isLight: false,
    isWalkable: false,
    isExit: false,
};

export const HEALTH_LIGHT_TILE = {
    textureIndex: 0,
    isLight: true,
    isWalkable: true,
    isExit: false,
};

export const DAMAGE_LIGHT_TILE = {
    textureIndex: 1,
    isLight: true,
    isWalkable: true,
    isExit: false,
};

export const SHIELD_LIGHT_TILE = {
    textureIndex: 2,
    isLight: true,
    isWalkable: true,
    isExit: false,
};

export const EXIT_TILE = {
    textureIndex: 0,
    isLight: false,
    isWalkable: true,
    isExit: true,
};

export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.subtilesWidth = width * 2;
        this.subtilesHeight = height * 2;
        this.tiles = new Array(width * height);
        this.entities = new Array(width * height);
        this.entityPositions = new Map();
        this.subTiles = new Array(this.subtilesWidth * this.subtilesHeight);
    }

    generateRooms = () => {
        let rooms = new Array(ROOM_COUNT);

        for (let i = 0; i < ROOM_COUNT; i++) {
            rooms[i] = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height),
                width: MIN_ROOM_SIZE + Math.floor(Math.random() * ROOM_SIZE_VARIANCE),
                height: MIN_ROOM_SIZE + Math.floor(Math.random() * ROOM_SIZE_VARIANCE),
            };
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.setTile(x, y, STONE_WALL_TILE);
            }
        }

        for (const room of rooms) {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    this.setTile(x, y, STONE_FLOOR_TILE);
                }
            }
        }

        for (let i = 1; i < rooms.length; i++) {
            const lastRoom = rooms[i - 1];
            const room = rooms[i];

            let startX;
            let endX;
            let startY = lastRoom.y + Math.floor(Math.random() * lastRoom.height);
            let endY;

            if (lastRoom.x < room.x) {
                startX = lastRoom.x + lastRoom.width;
                endX = room.x;
            } else {
                startX = room.x + room.width;
                endX = lastRoom.x;
            }

            for (let x = startX; x <= endX; x++) {
                this.setTile(x, startY, STONE_FLOOR_TILE);
            }

            if (lastRoom.y < room.y) {
                endY = room.y;
            } else {
                endY = lastRoom.y;
            }

            for (let y = startY; y <= endY; y++) {
                this.setTile(endX, y, STONE_FLOOR_TILE);
            }
        }
    }

    generateGameplay = () => {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.removeEntityAt(x, y);

                const tile = this.getTile(x, y);

                if (tile != STONE_FLOOR_TILE) {
                    continue;
                }

                if (Math.random() > 0.2) {
                    continue;
                }

                const lightType = Math.floor(Math.random() * 3);
                let light;
                switch (lightType) {
                    case 0:
                        light = HEALTH_LIGHT_TILE;
                        break;
                    case 1:
                        light = DAMAGE_LIGHT_TILE;
                        break;
                    case 2:
                        light = SHIELD_LIGHT_TILE;
                        break;
                }
                this.setTile(x, y, light);
            }
        }
    }

    generateExit = () => {
        const exitX = Math.floor(Math.random() * this.width);
        const exitY = Math.floor(Math.random() * this.height);
        this.setTile(exitX, exitY, EXIT_TILE);
    }

    generate = () => {
        this.generateRooms();
        this.generateGameplay();
        this.generateExit();
    }

    getTile = (x, y) => {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return STONE_WALL_TILE;
        }

        return this.tiles[x + y * this.width];
    }

    setTile = (x, y, tile) => {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return;
        }

        this.tiles[x + y * this.width] = tile;

        const startX = Math.max(x - 1, 0);
        const startY = Math.max(y - 1, 0);
        const endX = Math.min(x + 1, this.width - 1);
        const endY = Math.min(y + 1, this.height - 1);

        for (let neighborY = startY; neighborY <= endY; neighborY++) {
            for (let neighborX = startX; neighborX <= endX; neighborX++) {
                this.calculateSubtiles(neighborX, neighborY);
            }
        }
    }

    getEntityPosition = (entity) => {
        return this.entityPositions.get(entity);
    }

    removeEntityAt = (x, y) => {
        const entity = this.entities[x + y * this.width];

        if (!entity) {
            return;
        }

        this.entityPositions.delete(entity);

        this.entities[x + y * this.width] = null;
    }

    removeEntity = (entity) => {
        const entityPosition = this.entityPositions.get(entity);

        if (!entityPosition) {
            return;
        }

        this.removeEntityAt(entityPosition.x, entityPosition.y);
    }

    setEntity = (x, y, entity) => {
        this.removeEntity(x, y);

        // Try to remove the entity, so that entities can't get into the
        // world twice and cause problems.
        this.removeEntity(entity);

        if (!entity) {
            return;
        }

        this.entityPositions.set(entity, {
            x,
            y,
        });

        this.entities[x + y * this.width] = entity;
    }

    getEntity = (x, y) => {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }

        return this.entities[x + y * this.width];
    }

    moveEntity = (deltaX, deltaY, entity, particles, canPush = false) => {
        const entityPosition = this.entityPositions.get(entity);

        if (!entityPosition) {
            return;
        }

        const dstX = entityPosition.x + deltaX;
        const dstY = entityPosition.y + deltaY;

        const entityAtDst = this.getEntity(dstX, dstY);
        if (entityAtDst) {
            if (entityAtDst.isEnemy != entity.isEnemy) {
                this.attackEntity(entity, entityAtDst, particles);
            }

            return;
        }

        if (!this.getTile(dstX, dstY).isWalkable) {
            if (!canPush) {
                return;
            }

            if (deltaX < 0) {
                this.pushRowLeft(entityPosition.y);
            } else if (deltaX > 0) {
                this.pushRowRight(entityPosition.y);
            } else if (deltaY < 0) {
                this.pushRowUp(entityPosition.x);
            } else if (deltaY > 0) {
                this.pushRowDown(entityPosition.x);
            }

            return;
        }

        this.setEntity(dstX, dstY, entity);
    }

    attackEntity = (attacker, target, particles) => {
        const targetPosition = this.getEntityPosition(target);
        target.health -= Math.max(attacker.damage - target.shield, 0);
        if (target.health > 0) {
            particles.push(new Particle(targetPosition.x, targetPosition.y, SPARK_PARTICLE));
            return;
        }

        this.removeEntity(target);
        particles.push(new Particle(targetPosition.x, targetPosition.y, FIREWORK_PARTICLE));
    }

    updateEnemies = (particles) => {
        let enemies = [];

        for (const entity of this.entityPositions.keys()) {
            if (!entity.isEnemy) {
                continue;
            }

            enemies.push(entity);
        }

        for (const entity of enemies) {
            const direction = Math.floor(Math.random() * 4);
            let directionX = 0
            let directionY = 0;

            switch (direction) {
                case 0:
                    directionX = -1;
                    break;
                case 1:
                    directionX = 1;
                    break;
                case 2:
                    directionY = -1;
                    break;
                case 3:
                    directionY = 1;
                    break;
            }

            this.moveEntity(directionX, directionY, entity, particles);
        }
    }

    isOccupied = (x, y) => {
        return this.getEntity(x, y) || !this.getTile(x, y).isWalkable;
    }

    calculateSubtiles = (x, y) => {
        const tile = this.getTile(x, y);

        if (!tile) {
            return;
        }

        const tileTexX = TILE_TEXTURE_WIDTH * tile.textureIndex;

        for (let relX = 0; relX < 2; relX++) {
            for (let relY = 0; relY < 2; relY++) {
                let subTexX = TILE_TEXTURE_CENTER_X;
                let subTexY = TILE_TEXTURE_CENTER_Y;

                const directionX = relX * 2 - 1;
                const directionY = relY * 2 - 1;

                if (this.getTile(x + directionX, y) != tile) {
                    subTexX += directionX;
                }

                if (this.getTile(x, y + directionY) != tile) {
                    subTexY += directionY;
                }

                if (subTexX == TILE_TEXTURE_CENTER_X &&
                    subTexY == TILE_TEXTURE_CENTER_Y &&
                    this.getTile(x + directionX, y + directionY) != tile) {

                    subTexX = TILE_TEXTURE_CORNER_X - relX;
                    subTexY = TILE_TEXTURE_CORNER_Y - relY;
                }

                const subTileX = x * 2 + relX;
                const subTileY = y * 2 + relY;
                this.subTiles[subTileX + subTileY * this.subtilesWidth] = {
                    texX: tileTexX + subTexX * SUBTILE_SIZE,
                    texY: subTexY * SUBTILE_SIZE,
                };
            }
        }
    }

    isTileLit = (x, y, tile) => {
        return this.getTile(x + 1, y) == tile ||
        this.getTile(x - 1, y) == tile ||
        this.getTile(x, y + 1) == tile ||
        this.getTile(x, y - 1) == tile;
    }

    draw = (renderer, texture) => {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const tile = this.getTile(x, y);

                if (tile.isLight) {
                    const isLit = this.isTileLit(x, y, tile);

                    let texX = TILE_SIZE * tile.textureIndex * 2;

                    if (isLit) {
                        texX += TILE_SIZE;
                    }

                    renderer.drawSprite(
                        x * TILE_SIZE,
                        y * TILE_SIZE,
                        TILE_SIZE,
                        TILE_SIZE,
                        texture,
                        texX,
                        24,
                    );
                } else if (tile.isExit) {
                    renderer.drawSprite(
                        x * TILE_SIZE,
                        y * TILE_SIZE,
                        TILE_SIZE,
                        TILE_SIZE,
                        texture,
                        0,
                        88,
                    );
                } else {
                    for (let subY = 0; subY < 2; subY++) {
                        for (let subX = 0; subX < 2; subX++) {
                            const subTileX = x * 2 + subX;
                            const subTileY = y * 2 + subY;
                            const subTile = this.subTiles[subTileX + subTileY * this.subtilesWidth];

                            renderer.drawSprite(
                                subTileX * SUBTILE_SIZE,
                                subTileY * SUBTILE_SIZE,
                                SUBTILE_SIZE,
                                SUBTILE_SIZE,
                                texture,
                                subTile.texX,
                                subTile.texY,
                            );
                        }
                    }
                }

                const entity = this.entities[x + y * this.width];
                if (entity) {
                    const entityX = x * TILE_SIZE;
                    const entityY = y * TILE_SIZE;

                    renderer.drawSprite(
                        entityX,
                        entityY,
                        TILE_SIZE,
                        TILE_SIZE,
                        texture,
                        entity.textureIndex * TILE_SIZE,
                        40,
                    );
                }
            }
        }
    }

    pushRowLeft = (y) => {
        const loopedTile = this.getTile(0, y);
        const loopedEntity = this.getEntity(0, y);

        for (let x = 1; x < this.width; x++) {
            const tile = this.getTile(x, y);
            const entity = this.getEntity(x, y);

            this.setTile(x - 1, y, tile);
            this.setEntity(x - 1, y, entity);
        }

        this.setTile(this.width - 1, y, loopedTile);
        this.setEntity(this.width - 1, y, loopedEntity);
    }

    pushRowRight = (y) => {
        const loopedTile = this.getTile(this.width - 1, y);
        const loopedEntity = this.getEntity(this.width - 1, y);

        for (let x = this.width - 2; x >= 0; x--) {
            const tile = this.getTile(x, y);
            const entity = this.getEntity(x, y);

            this.setTile(x + 1, y, tile);
            this.setEntity(x + 1, y, entity);
        }

        this.setTile(0, y, loopedTile);
        this.setEntity(0, y, loopedEntity);
    }

    pushRowUp = (x) => {
        const loopedTile = this.getTile(x, 0);
        const loopedEntity = this.getEntity(x, 0);

        for (let y = 1; y < this.height; y++) {
            const tile = this.getTile(x, y);
            const entity = this.getEntity(x, y);

            this.setTile(x, y - 1, tile);
            this.setEntity(x, y - 1, entity);
        }

        this.setTile(x, this.height - 1, loopedTile);
        this.setEntity(x, this.height - 1, loopedEntity);
    }

    pushRowDown = (x) => {
        const loopedTile = this.getTile(x, this.height - 1);
        const loopedEntity = this.getEntity(x, this.height - 1);

        for (let y = this.height - 2; y >= 0; y--) {
            const tile = this.getTile(x, y);
            const entity = this.getEntity(x, y);

            this.setTile(x, y + 1, tile);
            this.setEntity(x, y + 1, entity);
        }

        this.setTile(x, 0, loopedTile);
        this.setEntity(x, 0, loopedEntity);
    }

    calculateBonuses = (bonuses, particles) => {
        bonuses.damage = 0;
        bonuses.health = 0;
        bonuses.shield = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                if (!tile || !tile.isLight ||
                    !this.isTileLit(x, y, tile)) continue;

                particles.push(new Particle(x, y, FIREWORK_PARTICLE));

                if (tile == DAMAGE_LIGHT_TILE) {
                    bonuses.damage += 1;
                    continue;
                }

                if (tile == HEALTH_LIGHT_TILE) {
                    bonuses.health += 1;
                    continue;
                }

                if (tile == SHIELD_LIGHT_TILE) {
                    bonuses.shield += 1;
                }
            }
        }
    }
}