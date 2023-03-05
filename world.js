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

    removeEntity = (x, y) => {
        this.entities[x + y * this.width] = null;
    }

    addEntity = (x, y, entity) => {
        this.entities[x + y * this.width] = entity;
    }

    getEntity = (x, y) => {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }

        return this.entities[x + y * this.width];
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
}