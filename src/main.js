import { Enemy } from "./enemy.js";
import { Input } from "./input.js";
import { Player } from "./player.js";
import { VIEW_WIDTH, VIEW_HEIGHT, Renderer } from "./renderer.js";
import { EXIT_TILE, STONE_FLOOR_TILE, TILE_SIZE, World } from "./world.js";

const VIEW_TILES_WIDTH = Math.floor(VIEW_WIDTH / TILE_SIZE);
const VIEW_TILES_HEIGHT = Math.floor(VIEW_HEIGHT / TILE_SIZE);
const ENEMY_COUNT = 7;
const ENEMY_SPAWN_RETRY_COUNT = 3;
const TRANSITION_TIME = 1.5;
const IN_GAME_STATE = 0;
const TRANSITION_STATE = 1;
const HEALTH_PER_BONUS = 5;
const DAMAGE_PER_BONUS = 5;
const SHIELD_PER_BONUS = 5;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
input.addListeners();

const renderer = new Renderer();
const tilesTexture = await renderer.loadTexture("tiles.png", 256, 256);

const world = new World(VIEW_TILES_WIDTH, VIEW_TILES_HEIGHT);
const player = new Player();

const bonuses = {
    damage: 0,
    health: 0,
    shield: 0,
};
const particles = [];
let gameState = {
    state: IN_GAME_STATE,
    transitionTimer: 0,
}

const fpsTime = 1;
let fpsTimer = 0;
let lastTime = performance.now();

// TODO: Handle player death.

const spawnEntities = () => {
    const playerSpawnX = Math.floor(Math.random() * world.width);
    const playerSpawnY = Math.floor(Math.random() * world.height);
    world.setTile(playerSpawnX, playerSpawnY, STONE_FLOOR_TILE);
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
}

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

    for (let i = 0; i < bonuses.damage; i++) {
        renderer.drawSprite(4 + i * 8, 4, 8, 8, tilesTexture, 0, 104);
    }

    for (let i = 0; i < bonuses.shield; i++) {
        renderer.drawSprite(4 + i * 8, 12, 8, 8, tilesTexture, 8, 104);
    }

    renderer.update(ctx);

    const drawEndTime = performance.now();

    fpsTimer += deltaTime;

    if (fpsTimer > fpsTime) {
        fpsTimer = 0;
        console.log(drawEndTime - drawStartTime);
    }
}

const updateInGame = (deltaTime) => {
    player.update(input, world, particles, deltaTime);

    const playerPosition = world.getEntityPosition(player);

    if (world.getTile(playerPosition.x, playerPosition.y) == EXIT_TILE) {
        world.calculateBonuses(bonuses, particles);
        player.heal(bonuses.health * HEALTH_PER_BONUS);
        player.setDamage(bonuses.damage * DAMAGE_PER_BONUS);
        player.setShield(bonuses.shield * SHIELD_PER_BONUS);
        gameState.state = TRANSITION_STATE;
    }
}

const updateTransition = (deltaTime) => {
    gameState.transitionTimer += deltaTime;

    if (gameState.transitionTimer >= TRANSITION_TIME) {
        gameState.transitionTimer = 0;
        gameState.state = IN_GAME_STATE;

        world.generate();
        spawnEntities();
    }
}

const update = () => {
    const newTime = performance.now();
    const deltaTime = (newTime - lastTime) * 0.001;
    lastTime = newTime;

    if (gameState.state == IN_GAME_STATE) {
        updateInGame(deltaTime);
    } else if (gameState.state == TRANSITION_STATE) {
        updateTransition(deltaTime);
    }

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

world.generate();
spawnEntities();

requestAnimationFrame(update);