export const TILE_SIZE = 16;
const SUBTILE_SIZE = 8;
const TILE_TEXTURE_WIDTH = SUBTILE_SIZE * 5;
const TILE_TEXTURE_CENTER_X = 1;
const TILE_TEXTURE_CENTER_Y = 1;
const TILE_TEXTURE_CORNER_X = 4;
const TILE_TEXTURE_CORNER_Y = 1;

export const GRASS_TILE = {
    textureIndex: 1,
};

export const WATER_TILE = {
    textureIndex: 0,
}

export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.subtilesWidth = width * 2;
        this.subtilesHeight = height * 2;
        this.tiles = new Array(width * height);
        this.subTiles = new Array(this.subtilesWidth * this.subtilesHeight);
    }

    generate = () => {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let tile = WATER_TILE;

                if (Math.random() < 0.4) {
                    tile = GRASS_TILE;
                }

                this.setTile(x, y, tile);
            }
        }
    }

    getTile = (x, y) => {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return WATER_TILE;
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
        for (let y = 0; y < this.subtilesHeight; y++) {
            for (let x = 0; x < this.subtilesWidth; x++) {
                const subTile = this.subTiles[x + y * this.subtilesWidth];

                renderer.drawSprite(
                    x * SUBTILE_SIZE,
                    y * SUBTILE_SIZE,
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