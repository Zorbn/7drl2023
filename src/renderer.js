const hiddenCanvas = document.createElement("canvas");
const hiddenCtx = hiddenCanvas.getContext("2d");

export const VIEW_WIDTH = 320;
export const VIEW_HEIGHT = 176;

export class Renderer {
    constructor() {
        this.imageData = new ImageData(VIEW_WIDTH, VIEW_HEIGHT);
        this.imageData.data.fill(255);
    }

    loadTexture = async (path, width, height) => {
        return new Promise((resolve) => {
            const image = new Image(width, height);
            image.src = path;
            image.onload = () => {
                hiddenCanvas.width = image.width;
                hiddenCanvas.height = image.height;
                hiddenCtx.drawImage(image, 0, 0);
                const imageData = hiddenCtx.getImageData(0, 0, image.width, image.height);

                // Returning this object instead of imageData directly is much
                // faster, because accessing imageData.width or imageData.height
                // is very costly in the hot path, such as when drawing sprites.
                // Copying the width and height into a structure like this gets
                // rid of that bottleneck. Copying the data into a new array
                // doesn't improve performance, so we don't do that.
                return resolve({
                    width: imageData.width,
                    height: imageData.height,
                    data: imageData.data,
                });
            };
        });
    }

    drawSpriteF = (texture, x, y, width, height, texX, texY) => {
        drawSprite(texture, Math.floor(x), Math.floor(y), width, height, texX, texY);
    }

    drawSprite = (x, y, width, height, texture, texX, texY) => {
        const startX = Math.max(x, 0);
        const startY = Math.max(y, 0);
        const endX = Math.min(x + width, VIEW_WIDTH);
        const endY = Math.min(y + height, VIEW_HEIGHT);
        const spanX = endX - startX;
        const spanY = endY - startY;

        for (let iy = 0; iy < spanY; iy++) {
            for (let ix = 0; ix < spanX; ix++) {
                const srcX = texX + ix;
                const srcY = texY + iy;
                const srcI = 4 * (srcX + srcY * texture.width);

                const srcR = texture.data[srcI];
                const srcG = texture.data[srcI + 1];
                const srcB = texture.data[srcI + 2];
                const srcA = texture.data[srcI + 3];

                if (srcA < 255) continue;

                const dstX = startX + ix;
                const dstY = startY + iy;
                const dstI = 4 * (dstX + dstY * VIEW_WIDTH);

                this.imageData.data[dstI] = srcR;
                this.imageData.data[dstI + 1] = srcG;
                this.imageData.data[dstI + 2] = srcB;
            }
        }
    }

    drawRect = (x, y, width, height, r, g, b) => {
        const startX = Math.max(x, 0);
        const startY = Math.max(y, 0);
        const endX = Math.min(x + width, VIEW_WIDTH);
        const endY = Math.min(y + height, VIEW_HEIGHT);
        const spanX = endX - startX;
        const spanY = endY - startY;

        for (let iy = 0; iy < spanY; iy++) {
            for (let ix = 0; ix < spanX; ix++) {
                const dstX = startX + ix;
                const dstY = startY + iy;
                const dstI = 4 * (dstX + dstY * VIEW_WIDTH);

                this.imageData.data[dstI] = r;
                this.imageData.data[dstI + 1] = g;
                this.imageData.data[dstI + 2] = b;
            }
        }
    }

    update = (ctx) => {
        ctx.putImageData(this.imageData, 0, 0);
    }
}