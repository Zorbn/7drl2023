export const TILE_SIZE = 16;
const SUBTILE_SIZE = 8;
const TILE_TEXTURE_WIDTH = SUBTILE_SIZE * 5;
const TILE_TEXTURE_CENTER_X = 1;
const TILE_TEXTURE_CENTER_Y = 1;
const TILE_TEXTURE_CORNER_X = 4;
const TILE_TEXTURE_CORNER_Y = 1;

export const STONE_FLOOR_TILE = {
    textureIndex: 0,
    walkable: true,
}

export const STONE_WALL_TILE = {
    textureIndex: 1,
    walkable: false,
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

    generate = () => {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let tile = STONE_FLOOR_TILE;

                if (Math.random() < 0.4) {
                    tile = STONE_WALL_TILE;
                }

                this.setTile(x, y, tile);
            }
        }
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

    moveEntity = (deltaX, deltaY, entity, canPush = false) => {
        const entityPosition = this.entityPositions.get(entity);

        if (!entityPosition) {
            return;
        }

        const dstX = entityPosition.x + deltaX;
        const dstY = entityPosition.y + deltaY;

        if (this.isOccupied(dstX, dstY)) {
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

    isOccupied = (x, y) => {
        return this.getEntity(x, y) || !this.getTile(x, y).walkable;
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

    draw = (renderer, texture) => {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const entity = this.entities[x + y * this.width];
                if (entity) {
                    renderer.drawSprite(
                        x * TILE_SIZE,
                        y * TILE_SIZE,
                        TILE_SIZE,
                        TILE_SIZE,
                        texture,
                        0, 24,
                    );
                    continue;
                }

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
}