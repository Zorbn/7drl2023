import { Input } from "./input.js";

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;

let imageData = new ImageData(VIEW_WIDTH, VIEW_HEIGHT);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
input.addListeners();

const fpsTime = 1;
let fpsTimer = 0;
let lastTime = performance.now();
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

const drawSpriteF = (x, y, width, height) => {
    drawSprite(Math.floor(x), Math.floor(y), width, height);
}

const drawSprite = (x, y, width, height) => {
    const startX = Math.max(x, 0);
    const startY = Math.max(y, 0);
    const endX = Math.min(x + width, VIEW_WIDTH);
    const endY = Math.min(y + height, VIEW_HEIGHT);

    for (let ix = startX; ix < endX; ix++) {
        for (let iy = startY; iy < endY; iy++) {
            const i = 4 * (ix + iy * VIEW_WIDTH);
            imageData.data[i] = 255;
            imageData.data[i + 1] = 125;
            imageData.data[i + 2] = 0;
            imageData.data[i + 3] = 255;
        }
    }
}

const draw = (deltaTime) => {
    const drawStartTime = performance.now();

    for (let y = 0; y < VIEW_HEIGHT; y++) {
        for (let x = 0; x < VIEW_WIDTH; x++) {
            const i = 4 * (x + y * VIEW_WIDTH);
            const r = i % 16 > 2 ? 125 : 155;
            imageData.data[i] = r;
            imageData.data[i + 1] = 125;
            imageData.data[i + 2] = 0;
            imageData.data[i + 3] = 255;
        }
    }

    drawSpriteF(player.x, player.y, 16, 16);

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
    const deltaTime = (newTime - lastTime ) * 0.001;
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