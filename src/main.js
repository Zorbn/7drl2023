import { Enemy } from "./enemy.js";
import { Input } from "./input.js";
import { Player } from "./player.js";
import { VIEW_WIDTH, VIEW_HEIGHT, Renderer } from "./renderer.js";
import { STONE_FLOOR_TILE, TILE_SIZE, World } from "./world.js";

const VIEW_TILES_WIDTH = Math.floor(VIEW_WIDTH / TILE_SIZE);
const VIEW_TILES_HEIGHT = Math.floor(VIEW_HEIGHT / TILE_SIZE);
const ENEMY_COUNT = 7;
const ENEMY_SPAWN_RETRY_COUNT = 3;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
input.addListeners();

const renderer = new Renderer();
const tilesTexture = await renderer.loadTexture("tiles.png", 256, 256);

const world = new World(VIEW_TILES_WIDTH, VIEW_TILES_HEIGHT);
world.generate();

const playerSpawnX = Math.floor(Math.random() * world.width);
const playerSpawnY = Math.floor(Math.random() * world.height);
world.setTile(playerSpawnX, playerSpawnY, STONE_FLOOR_TILE);
const player = new Player();
world.setEntity(playerSpawnX, playerSpawnY, player);

for (let i = 0; i < ENEMY_COUNT; i++) {
    for (let j = 0; j < ENEMY_SPAWN_RETRY_COUNT; j++) {
        const x = Math.floor(Math.random() * world.width);
        const y = Math.floor(Math.random() * world.height);
        if (world.isOccupied(x, y)) continue;
        world.setEntity(x, y, new Enemy());
        break;
    }
}

const particles = [];

const fpsTime = 1;
let fpsTimer = 0;
let lastTime = performance.now();

const draw = (deltaTime) => {
    const drawStartTime = performance.now();

    world.draw(renderer, tilesTexture);

    for (const particle of particles) {
        particle.draw(renderer, tilesTexture);
    }

    const playerPosition = world.getEntityPosition(player);
    if (playerPosition) {
        player.drawHealthbar(
            renderer,
            playerPosition.x * TILE_SIZE,
            (playerPosition.y + 1) * TILE_SIZE + 1,
        );
    }

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

    player.update(input, world, particles, deltaTime);

    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].update(deltaTime)) {
            particles.splice(i, 1);
        }
    }

    draw(deltaTime);

    input.update();

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