import { Input } from "./input.js";

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;
const TILE_SIZE = 16;
const VIEW_TILES_WIDTH = Math.floor(VIEW_WIDTH / TILE_SIZE);
const VIEW_TILES_HEIGHT = Math.floor(VIEW_HEIGHT / TILE_SIZE);

let imageData = new ImageData(VIEW_WIDTH, VIEW_HEIGHT);
imageData.data.fill(255);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hiddenCanvas = document.createElement("canvas");
hiddenCanvas.width = 100;
hiddenCanvas.height = 100;
document.body.appendChild(hiddenCanvas);
const hiddenCtx = hiddenCanvas.getContext("2d");
hiddenCtx.fillStyle = "red";
hiddenCtx.fillRect(0, 0, 64, 64);

const input = new Input();
input.addListeners();

const fpsTime = 1;
let fpsTimer = 0;
let lastTime = performance.now();

const loadTexture = async (path, width, height) => {
    return new Promise((resolve) => {
        const image = new Image(width, height);
        image.src = path;
        image.onload = () => {
            hiddenCanvas.width = image.width;
            hiddenCanvas.height = image.height;
            hiddenCtx.fillRect(0, 0, width, height);
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

const tilesTexture = await loadTexture("tiles.png", 256, 256);

let player = {
    x: 0,
    y: 0,
    speed: 40,
    update: (deltaTime) => {
        let directionX = 0;
        let directionY = 0;

        if (input.isKeyPressed("KeyA")) {
            directionX -= 1;
        }

        if (input.isKeyPressed("KeyD")) {
            directionX += 1;
        }

        if (input.isKeyPressed("KeyW")) {
            directionY -= 1;
        }

        if (input.isKeyPressed("KeyS")) {
            directionY += 1;
        }

        const currentSpeed = player.speed * deltaTime;
        player.x += directionX * currentSpeed;
        player.y += directionY * currentSpeed;
    },
};

const drawSpriteF = (texture, x, y, width, height, texX, texY) => {
    drawSprite(texture, Math.floor(x), Math.floor(y), width, height, texX, texY);
}

const drawSprite = (x, y, width, height, texture, texX, texY) => {
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
            const srcI = 4 * (srcX + srcY * tilesTexture.width);

            const srcR = tilesTexture.data[srcI];
            const srcG = tilesTexture.data[srcI + 1];
            const srcB = tilesTexture.data[srcI + 2];
            // const srcA = tilesTexture.data[srcI + 3];

            // if (srcA < 255) continue;

            const dstX = startX + ix;
            const dstY = startY + iy;
            const dstI = 4 * (dstX + dstY * VIEW_WIDTH);

            imageData.data[dstI] = srcR;
            imageData.data[dstI + 1] = srcG;
            imageData.data[dstI + 2] = srcB;
        }
    }
}

const draw = (deltaTime) => {
    const drawStartTime = performance.now();

    for (let y = 0; y < VIEW_TILES_HEIGHT; y++) {
        for (let x = 0; x < VIEW_TILES_WIDTH; x++) {
            drawSprite(x * TILE_SIZE, y * TILE_SIZE,
                TILE_SIZE, TILE_SIZE, tilesTexture, 0, 0);
        }
    }

    ctx.putImageData(imageData, 0, 0);

    const drawEndTime = performance.now();

    fpsTimer += deltaTime;

    if (fpsTimer > fpsTime) {
        fpsTimer = 0;
        console.log(drawEndTime - drawStartTime);
    }
}

const update = () => {
    const newTime = performance.now();
    const deltaTime = (newTime - lastTime) * 0.001;
    lastTime = newTime;

    player.update(deltaTime);

    draw(deltaTime);

    requestAnimationFrame(update);
}

const resize = () => {
    const widthRatio = window.innerWidth / VIEW_WIDTH;
    const heightRatio = window.innerHeight / VIEW_HEIGHT;

    if (widthRatio < heightRatio) {
        canvas.style.width = "100vw";
        canvas.style.height = "";
        return;
    }

    canvas.style.width = "";
    canvas.style.height = "100vh";
};

window.addEventListener("resize", resize);
resize();

requestAnimationFrame(update);