import { Input } from "./input.js";
import { VIEW_WIDTH, VIEW_HEIGHT, Renderer } from "./renderer.js";
import { TILE_SIZE, World } from "./world.js";

const VIEW_TILES_WIDTH = Math.floor(VIEW_WIDTH / TILE_SIZE);
const VIEW_TILES_HEIGHT = Math.floor(VIEW_HEIGHT / TILE_SIZE);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
input.addListeners();

const renderer = new Renderer();
const tilesTexture = await renderer.loadTexture("tiles.png", 256, 256);

const world = new World(VIEW_TILES_WIDTH, VIEW_TILES_HEIGHT);
world.generate();

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

const draw = (deltaTime) => {
    const drawStartTime = performance.now();

    world.draw(renderer, tilesTexture);

    renderer.update(ctx);

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