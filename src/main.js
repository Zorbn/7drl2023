import { Enemy, ENEMY_TYPES } from "./enemy.js";
import { randomInt } from "./gameMath.js";
import { Input } from "./input.js";
import { Sound } from "./sound.js";
import { Player } from "./player.js";
import { VIEW_WIDTH, VIEW_HEIGHT, Renderer } from "./renderer.js";
import { EXIT_TILE, STONE_FLOOR_TILE, TILE_SIZE, World } from "./world.js";

const VIEW_TILES_WIDTH = Math.floor(VIEW_WIDTH / TILE_SIZE);
const VIEW_TILES_HEIGHT = Math.floor(VIEW_HEIGHT / TILE_SIZE);

const BASE_ENEMY_COUNT = 7;
const ENEMY_COUNT_INCREMENT = 3;
const MAX_ENEMY_COUNT = 25;
const ENEMY_SPAWN_RETRY_COUNT = 3;

const TRANSITION_TIME = 1.0;

const MENU_STATE = 0;
const IN_GAME_STATE = 1;
const TRANSITION_STATE = 2;

const STARTING_LEVEL = 1;

const HEALTH_PER_BONUS = 10;
const DAMAGE_PER_BONUS = 5;
const SHIELD_PER_BONUS = 5;

const LOG_DRAW_TIME = false;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
input.addListeners();

const sound = new Sound();

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
    state: MENU_STATE,
    transitionTimer: 0,
    level: STARTING_LEVEL,
}

const fpsTime = 1;
let fpsTimer = 0;
let lastTime = performance.now();

const spawnEntities = () => {
    const playerSpawnX = randomInt(world.width);
    const playerSpawnY = randomInt(world.height);
    world.setTile(playerSpawnX, playerSpawnY, STONE_FLOOR_TILE);
    world.setEntity(playerSpawnX, playerSpawnY, player);

    const enemyCount = Math.min(BASE_ENEMY_COUNT +
        ENEMY_COUNT_INCREMENT * gameState.level, MAX_ENEMY_COUNT);

    for (let i = 0; i < enemyCount; i++) {
        for (let j = 0; j < ENEMY_SPAWN_RETRY_COUNT; j++) {
            const x = randomInt(world.width);
            const y = randomInt(world.height);
            if (world.isOccupied(x, y)) continue;

            const enemyTypeIndex = randomInt(ENEMY_TYPES.length) % gameState.level;

            world.setEntity(x, y, new Enemy(ENEMY_TYPES[enemyTypeIndex]));
            break;
        }
    }
}

const drawMenu = () => {
    renderer.drawRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT, 0, 0, 0);
    renderer.drawSprite(60, 64, 200, 48, tilesTexture, 0, 208);
}

const drawGame = (deltaTime) => {
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

    renderer.drawSprite(4, 4, 8, 8, tilesTexture, 0, 112);

    const levelChars = gameState.level.toString();

    for (let i = 0; i < levelChars.length; i++) {
        const digit = levelChars.charAt(i) - '0';
        renderer.drawSprite(12 + i * 8, 4, 8, 8, tilesTexture, (digit + 1) * 8, 112);
    }

    for (let i = 0; i < bonuses.damage; i++) {
        renderer.drawSprite(4 + i * 8, 14, 8, 8, tilesTexture, 0, 104);
    }

    for (let i = 0; i < bonuses.shield; i++) {
        renderer.drawSprite(4 + i * 8, 24, 8, 8, tilesTexture, 8, 104);
    }
}

const updateMenu = () => {
    if (!input.wasAnyKeyReleased()) {
        return;
    }

    sound.success.play();
    gameState.state = IN_GAME_STATE;
}

const updateInGame = (deltaTime) => {
    player.update(input, sound, world, particles, deltaTime);

    if (player.health <= 0) {
        player.resetStats();
        gameState.level = STARTING_LEVEL;
        gameState.state = TRANSITION_STATE;
        return;
    }

    const playerPosition = world.getEntityPosition(player);

    if (world.isCleared &&
        world.getTile(playerPosition.x, playerPosition.y) == EXIT_TILE) {

        world.calculateBonuses(bonuses, particles);
        player.heal(bonuses.health * HEALTH_PER_BONUS);
        player.setDamage(bonuses.damage * DAMAGE_PER_BONUS);
        player.setShield(bonuses.shield * SHIELD_PER_BONUS);
        sound.success.play();
        gameState.level++;
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

    switch (gameState.state) {
        case MENU_STATE:
            updateMenu();
            break;
        case IN_GAME_STATE:
            updateInGame(deltaTime);
            break;
        case TRANSITION_STATE:
            updateTransition(deltaTime);
            break;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].update(deltaTime)) {
            particles.splice(i, 1);
        }
    }

    const drawStartTime = performance.now();

    switch (gameState.state) {
        case MENU_STATE:
            drawMenu();
            break;
        case IN_GAME_STATE:
            drawGame(deltaTime)
            break;
        case TRANSITION_STATE:
            drawGame(deltaTime)
            break;
    }

    renderer.update(ctx);

    if (LOG_DRAW_TIME) {
        const drawEndTime = performance.now();

        fpsTimer += deltaTime;

        if (fpsTimer > fpsTime) {
            fpsTimer = 0;
            console.log(drawEndTime - drawStartTime);
        }
    }

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