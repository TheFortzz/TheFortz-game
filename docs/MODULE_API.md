# Module API Reference

Complete API documentation for all game modules.

## Table of Contents

- [Core Modules](#core-modules)
  - [Config.js](#configjs)
  - [GameState.js](#gamestatejs)
  - [GameLoop.js](#gameloopjs)
  - [ModuleManager.js](#modulemanagerjs)
- [System Modules](#system-modules)
  - [RenderSystem.js](#rendersystemjs)
  - [InputSystem.js](#inputsystemjs)
  - [NetworkSystem.js](#networksystemjs)
  - [PhysicsSystem.js](#physicssystemjs)
  - [WeaponSystem.js](#weaponsystemjs)
  - [ParticleSystem.js](#particlesystemjs)
- [Entity Modules](#entity-modules)
  - [Player.js](#playerjs)
  - [Tank.js](#tankjs)
  - [Bullet.js](#bulletjs)
- [Utility Modules](#utility-modules)
  - [MathUtils.js](#mathutilsjs)
  - [CollisionUtils.js](#collisionutilsjs)
  - [StorageUtils.js](#storageutilsjs)
- [Asset Modules](#asset-modules)
  - [ImageLoader.js](#imageloaderjs)

---

## Core Modules

### Config.js

Centralized configuration and constants for the entire game.

#### Exports

**TANK_CONFIG**
```javascript
{
  colors: string[],           // Available tank colors
  bodies: string[],           // Available tank bodies
  weapons: string[],          // Available weapons
  prices: {                   // Item prices
    colors: Object,
    bodies: Object,
    weapons: Object
  },
  colorMultipliers: Object    // Price multipliers per color
}
```

**PHYSICS_CONFIG**
```javascript
{
  TANK_ACCELERATION: number,
  TANK_DECELERATION: number,
  TANK_MAX_SPEED: number,
  TANK_SPRINT_MAX_SPEED: number,
  TANK_TURN_SPEED: number,
  BULLET_SPEED: number,
  BULLET_LIFETIME: number,
  COLLISION_RADIUS: number
}
```

**NETWORK_CONFIG**
```javascript
{
  SOCKET_INTERVAL_TIME: number,
  RECONNECT_DELAY: number,
  MAX_RECONNECT_ATTEMPTS: number
}
```

**UI_CONFIG**, **STORAGE_KEYS**, **DEFAULT_GAME_STATE**

#### Usage
```javascript
import { TANK_CONFIG, PHYSICS_CONFIG } from './core/Config.js';

const maxSpeed = PHYSICS_CONFIG.TANK_MAX_SPEED;
const tankColors = TANK_CONFIG.colors;
```

---

### GameState.js

Centralized state management with listener pattern.

#### Class: GameStateManager

**Constructor**
```javascript
constructor()
```

**Methods**

`getGameState(): Object`
- Returns current game state

`getLockerState(): Object`
- Returns current locker state

`updateGameState(updates: Object): void`
- Updates game state properties
- Notifies listeners of changes

`updateLockerState(updates: Object): void`
- Updates locker state properties

`resetGameState(): void`
- Resets game state to defaults

`addListener(stateType: string, listenerId: string, callback: Function): void`
- Adds state change listener
- stateType: 'gameState' or 'lockerState'

`removeListener(stateType: string, listenerId: string): void`
- Removes state change listener

`initializePlayer(playerId: string, playerData: Object): void`
- Initializes player in game state

`removePlayer(playerId: string): void`
- Removes player from game state

`updatePlayer(playerId: string, updates: Object): void`
- Updates player data

#### Usage
```javascript
import gameStateManager from './core/GameState.js';

// Get state
const state = gameStateManager.getGameState();

// Update state
gameStateManager.updateGameState({ isInLobby: false });

// Listen to changes
gameStateManager.addListener('gameState', 'myId', (oldState, newState) => {
  console.log('State changed');
});
```

---


### GameLoop.js

Main game loop coordination.

#### Class: GameLoop

**Constructor**
```javascript
constructor(gameState: Object, systems: Object)
```

**Methods**

`start(): void`
- Starts the game loop

`stop(): void`
- Stops the game loop

`loop(): void`
- Main game loop (internal)

`update(deltaTime: number): void`
- Updates all game systems
- deltaTime: Time since last frame in milliseconds

`render(): void`
- Renders the game

#### Usage
```javascript
import GameLoop from './core/GameLoop.js';

const gameLoop = new GameLoop(gameState, systems);
gameLoop.start();
```

---

### ModuleManager.js

Module initialization and lifecycle management.

#### Class: ModuleManager (Singleton)

**Methods**

`async initialize(canvas: HTMLCanvasElement): Promise<void>`
- Initializes all game modules
- Throws error if initialization fails

`start(): void`
- Starts the game systems
- Throws error if not initialized

`stop(): void`
- Stops the game systems

`getSystem(systemName: string): Object|null`
- Returns system instance by name
- Returns null if not found

`getGameStateManager(): Object`
- Returns game state manager instance

`getGameLoop(): Object`
- Returns game loop instance

`cleanup(): void`
- Cleans up all modules

#### Usage
```javascript
import moduleManager from './core/ModuleManager.js';

// Initialize
await moduleManager.initialize(canvas);

// Start
moduleManager.start();

// Get system
const renderSystem = moduleManager.getSystem('render');

// Cleanup
moduleManager.cleanup();
```

---

## System Modules

### RenderSystem.js

Centralized rendering system for all game visuals.

#### Class: RenderSystem

**Constructor**
```javascript
constructor(gameState: Object, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, 
            minimapCanvas: HTMLCanvasElement, minimapCtx: CanvasRenderingContext2D)
```

**Methods**

`setDependencies(particleSystem, imageLoader, tankImages, weaponImages, imagesLoaded, spriteAnimations): void`
- Sets dependencies after construction

`resizeCanvas(): void`
- Resizes canvas to window dimensions

`render(): void`
- Main render function, coordinates all rendering

`renderLobbyBackground(): void`
- Renders lobby background

`drawAITanks(): void`
- Draws AI tanks from map

`drawPlayers(): void`
- Draws player tanks

`getCurrentTankImages(playerTank: Object, forLobby: boolean): Object`
- Returns {tankImg, weaponImg} for given tank config

`showNotification(text: string, color: string, size: number): void`
- Displays notification on screen

#### Usage
```javascript
import RenderSystem from './systems/RenderSystem.js';

const renderSystem = new RenderSystem(gameState, canvas, ctx, minimapCanvas, minimapCtx);
renderSystem.setDependencies(particleSystem, imageLoader, tankImages, weaponImages, true, animations);
renderSystem.render();
```

---

### InputSystem.js

Input handling and event management.

#### Class: InputSystem

**Constructor**
```javascript
constructor()
```

**Methods**

`initialize(): void`
- Initializes input system

`setupInputHandlers(): void`
- Sets up input event handlers

`isKeyPressed(key: string): boolean`
- Checks if key is currently pressed

`getMouseState(): Object`
- Returns current mouse state {x, y, down, angle}

`getTouchState(): Object`
- Returns current touch state {x, y, active}

`getInputState(): Object`
- Returns complete input state

`getMovementInput(): Object`
- Returns movement input {x, y} from WASD/arrows

`isMoving(): boolean`
- Returns true if any movement key is pressed

`getGameInputFlags(): Object`
- Returns {autoFireEnabled, aimbotEnabled, isSprinting}

`update(deltaTime: number, gameState: Object): void`
- Updates input system

`cleanup(): void`
- Cleans up input system

#### Usage
```javascript
import InputSystem from './systems/InputSystem.js';

const inputSystem = new InputSystem();
inputSystem.initialize();

// Get movement
const movement = inputSystem.getMovementInput();

// Check key
if (inputSystem.isKeyPressed('w')) {
  // Move forward
}
```

---

### NetworkSystem.js

WebSocket communication with game server.

#### Class: NetworkSystem

**Constructor**
```javascript
constructor(gameStateManager: Object)
```

**Methods**

`initialize(serverUrl: string|null): void`
- Initializes network system

`connectToServer(gameMode: string): Promise<void>`
- Connects to game server
- gameMode: 'ffa', 'tdm', etc.

`disconnect(): void`
- Disconnects from server

`sendToServer(type: string, data: Object): void`
- Sends message to server

`handleServerMessage(data: Object): void`
- Handles incoming server messages

`registerMessageHandler(messageType: string, handler: Function): void`
- Registers custom message handler

`unregisterMessageHandler(messageType: string): void`
- Unregisters message handler

`startMovementUpdates(): void`
- Starts sending movement updates

`stopMovementUpdates(): void`
- Stops sending movement updates

`getConnectionStatus(): boolean`
- Returns connection status

`sendPlayerShoot(angle: number, tankVelocity: Object): void`
- Sends shoot action to server

`sendCollectPowerUp(powerUpId: string): void`
- Sends power-up collection to server

`cleanup(): void`
- Cleans up network system

#### Usage
```javascript
import NetworkSystem from './systems/NetworkSystem.js';

const networkSystem = new NetworkSystem(gameStateManager);
networkSystem.initialize();
await networkSystem.connectToServer('ffa');

// Send message
networkSystem.sendToServer('playerShoot', { angle: 0 });

// Register handler
networkSystem.registerMessageHandler('customEvent', (data) => {
  console.log('Custom event:', data);
});
```

---


### PhysicsSystem.js

Tank movement, collision detection, and physics calculations.

#### Class: PhysicsSystem

**Constructor**
```javascript
constructor(gameState: Object)
```

**Methods**

`updateTankPhysics(inputX: number, inputY: number): void`
- Updates tank physics with input
- inputX, inputY: -1 to 1

`isNearWall(x: number, y: number): boolean`
- Checks if position collides with wall

`distance(point1: Object, point2: Object): number`
- Calculates distance between two points

`distanceToSegment(px, py, x1, y1, x2, y2): number`
- Calculates distance from point to line segment

`updateCamera(player: Object): void`
- Updates camera to follow player

`updateSprintSystem(): void`
- Updates sprint stamina and cooldown

`applyRecoil(vx: number, vy: number, duration: number): void`
- Applies recoil force to tank

`getCurrentPlayerVelocity(playerId: string): Object`
- Returns velocity {x, y} for player

`updateBulletPhysics(): void`
- Updates bullet positions

`interpolatePlayerPositions(): void`
- Interpolates other players' positions

`update(deltaTime: number): void`
- Updates physics system

`getTankSize(): number`
- Returns tank size for collision

`getTankRadius(): number`
- Returns tank radius for collision

`getTankVelocity(): Object`
- Returns current tank velocity {x, y}

`getIsSprinting(): boolean`
- Returns sprint status

`setIsSprinting(sprinting: boolean): void`
- Sets sprint status

`getSprintStamina(): number`
- Returns current sprint stamina

#### Usage
```javascript
import PhysicsSystem from './systems/PhysicsSystem.js';

const physicsSystem = new PhysicsSystem(gameState);

// Update physics
physicsSystem.updateTankPhysics(inputX, inputY);

// Check collision
if (physicsSystem.isNearWall(x, y)) {
  // Handle collision
}

// Apply recoil
physicsSystem.applyRecoil(vx, vy, 10);
```

---

### WeaponSystem.js

Weapon behavior, shooting, and animations.

#### Class: WeaponSystem

**Constructor**
```javascript
constructor(gameState: Object, networkSystem: Object, particleSystem: Object, imageLoader: Object)
```

**Methods**

`update(deltaTime: number, activePowerUps: Array): void`
- Updates weapon system

`handleShooting(currentTime: number, activePowerUps: Array): void`
- Handles shooting input

`triggerWeaponAnimation(playerTank: Object, playerId: string): void`
- Triggers weapon shooting animation

`triggerTankBodyAnimation(playerTank: Object, playerId: string): void`
- Triggers tank body animation

`getBulletColorFromWeapon(weaponColor: string): Object`
- Returns bullet color scheme

`getTankStats(weapon: string, color: string): Object`
- Returns tank stats {health, damage, fireRate}

`getWeaponStats(weapon: string, color: string): Object`
- Alias for getTankStats

`isShopComboOwned(color: string, weapon: string): boolean`
- Checks if shop combo is owned

`isShopComboEquipped(color: string, weapon: string): boolean`
- Checks if shop combo is equipped

`renderShopTankPreview(canvas: HTMLCanvasElement, color: string, weapon: string): void`
- Renders tank preview in shop

`async purchaseOrEquipShopCombo(color: string, weapon: string, price: number): Promise<void>`
- Purchases or equips shop combo

`renderLockerTankWeaponOnly(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, tank: Object): void`
- Renders weapon only in locker

`canShoot(currentTime: number, activePowerUps: Array): boolean`
- Checks if weapon can shoot

`getGunRecoilAnimation(): Object`
- Returns gun recoil animation state

`getPlayerRecoil(): Object`
- Returns player recoil state

`cleanup(): void`
- Cleans up weapon system

#### Usage
```javascript
import WeaponSystem from './systems/WeaponSystem.js';

const weaponSystem = new WeaponSystem(gameState, networkSystem, particleSystem, imageLoader);

// Handle shooting
weaponSystem.handleShooting(Date.now(), activePowerUps);

// Get tank stats
const stats = weaponSystem.getTankStats('turret_01_mk1', 'blue');
console.log(`Health: ${stats.health}, Damage: ${stats.damage}`);

// Render shop preview
weaponSystem.renderShopTankPreview(canvas, 'red', 'turret_02_mk4');
```

---

### ParticleSystem.js

Visual effects and particle management.

#### Class: ParticleSystem

**Constructor**
```javascript
constructor(gameState: Object, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D)
```

**Methods**

`update(): void`
- Updates all particle systems

`render(): void`
- Renders all particle effects

`createBulletTrail(bullet: Object): void`
- Creates bullet trail particle

`createExplosion(x: number, y: number, size: number): void`
- Creates explosion particles

`createBulletImpact(x: number, y: number, impactType: string, bulletColor: string): void`
- Creates bullet impact particles

`createExhaustSmoke(x: number, y: number, tankRotation: number, velocity: Object, isSprinting: boolean): void`
- Creates exhaust smoke particles

`triggerMuzzleFlash(playerId: string): void`
- Triggers muzzle flash for player

`triggerScreenShake(intensity: number, duration: number): void`
- Triggers screen shake effect

`toggleWeather(type: string): boolean`
- Toggles weather system (rain, snow)
- Returns new active state

`clearAllParticles(): void`
- Clears all particles

`getStats(): Object`
- Returns particle system statistics

#### Usage
```javascript
import ParticleSystem from './systems/ParticleSystem.js';

const particleSystem = new ParticleSystem(gameState, canvas, ctx);

// Create explosion
particleSystem.createExplosion(x, y, 1.5);

// Create bullet trail
particleSystem.createBulletTrail(bullet);

// Toggle weather
const isActive = particleSystem.toggleWeather('rain');

// Get stats
const stats = particleSystem.getStats();
console.log(`Total particles: ${stats.total}`);
```

---

## Entity Modules

### Player.js

Player entity with game logic.

#### Class: Player

**Constructor**
```javascript
constructor(playerId: string, playerData: Object)
```

**Methods**

`update(deltaTime: number, inputState: Object): void`
- Updates player state

`shoot(): Object|null`
- Attempts to shoot
- Returns bullet data or null

`takeDamage(damage: number): boolean`
- Takes damage
- Returns true if player died

`heal(amount: number): void`
- Heals the player

`respawn(x: number, y: number): void`
- Respawns the player

`addKill(): void`
- Adds kill to player's score

`getPosition(): Object`
- Returns position {x, y}

`setPosition(x: number, y: number): void`
- Sets player position

`getTankConfig(): Object`
- Returns tank configuration

`setTankConfig(tankConfig: Object): void`
- Sets tank configuration

`serialize(): Object`
- Returns serializable player data

**Static Methods**

`static deserialize(data: Object): Player`
- Creates player from serialized data

#### Usage
```javascript
import Player from './entities/Player.js';

const player = new Player('player1', { x: 100, y: 100 });

// Update
player.update(deltaTime, inputState);

// Shoot
const bullet = player.shoot();
if (bullet) {
  // Add bullet to game
}

// Take damage
const died = player.takeDamage(25);
if (died) {
  player.respawn(0, 0);
}
```

---


### Tank.js

Tank rendering and configuration.

#### Class: Tank

**Constructor**
```javascript
constructor(tankConfig: Object)
```

**Properties**
- `color: string` - Tank color
- `body: string` - Tank body type
- `weapon: string` - Weapon type
- `visualSize: number` - Visual size for rendering

**Methods**

`getConfig(): Object`
- Returns tank configuration {color, body, weapon}

`setConfig(config: Object): void`
- Sets tank configuration

`getTankAssetKey(): string`
- Returns asset key "color_body"

`getWeaponAssetKey(): string`
- Returns asset key "color_weapon"

`renderBody(ctx: CanvasRenderingContext2D, tankImg: Image, options: Object): void`
- Renders tank body
- options: {rotation, scale, spriteAnimation}

`renderWeapon(ctx: CanvasRenderingContext2D, weaponImg: Image, options: Object): void`
- Renders tank weapon
- options: {weaponAngle, scale, spriteAnimation}

`render(ctx: CanvasRenderingContext2D, images: Object, options: Object): void`
- Renders complete tank (body + weapon)
- images: {tankImg, weaponImg}
- options: {x, y, bodyRotation, weaponAngle, scale, tankAnimation, weaponAnimation}

`getStats(): Object`
- Returns tank stats {speed, fireRate, damage, health}

`serialize(): Object`
- Returns serializable tank data

**Static Methods**

`static deserialize(data: Object): Tank`
- Creates tank from serialized data

`static isValidConfig(config: Object): boolean`
- Validates tank configuration

`static getDefaultConfig(): Object`
- Returns default tank configuration

#### Usage
```javascript
import Tank from './entities/Tank.js';

const tank = new Tank({ color: 'blue', body: 'body_halftrack', weapon: 'turret_01_mk1' });

// Render tank
tank.render(ctx, { tankImg, weaponImg }, {
  x: 100,
  y: 100,
  bodyRotation: 0,
  weaponAngle: Math.PI / 4,
  scale: 1
});

// Get stats
const stats = tank.getStats();

// Validate config
if (Tank.isValidConfig(config)) {
  // Config is valid
}
```

---

### Bullet.js

Bullet physics and rendering.

#### Class: Bullet

**Constructor**
```javascript
constructor(bulletData: Object)
```

**Properties**
- `x, y: number` - Position
- `vx, vy: number` - Velocity
- `rotation: number` - Rotation angle
- `ownerId: string` - Owner player ID
- `color: string` - Bullet color
- `damage: number` - Damage amount
- `createdAt: number` - Creation timestamp
- `lifetime: number` - Lifetime in milliseconds
- `isActive: boolean` - Active status

**Methods**

`update(deltaTime: number): void`
- Updates bullet position

`render(ctx: CanvasRenderingContext2D, bulletColors: Object|null): void`
- Renders bullet with effects

`getDefaultColors(): Object`
- Returns default blue bullet colors

`checkCollision(x: number, y: number, radius: number): boolean`
- Checks collision with point

`deactivate(): void`
- Deactivates bullet

`getSpeed(): number`
- Returns bullet speed magnitude

`getDirection(): number`
- Returns bullet direction angle

`getAge(): number`
- Returns bullet age in milliseconds

`isExpired(): boolean`
- Returns true if bullet exceeded lifetime

`serialize(): Object`
- Returns serializable bullet data

**Static Methods**

`static deserialize(data: Object): Bullet`
- Creates bullet from serialized data

`static createFromPlayer(player: Object, options: Object): Bullet`
- Creates bullet from player position
- options: {speed, offset, color, damage}

#### Usage
```javascript
import Bullet from './entities/Bullet.js';

// Create from player
const bullet = Bullet.createFromPlayer(player, {
  speed: 10,
  offset: 30,
  color: 'blue',
  damage: 25
});

// Update
bullet.update(deltaTime);

// Render
bullet.render(ctx);

// Check collision
if (bullet.checkCollision(targetX, targetY, 32)) {
  bullet.deactivate();
}
```

---

## Utility Modules

### MathUtils.js

Common mathematical operations.

#### Static Methods

`static clamp(value: number, min: number, max: number): number`
- Clamps value between min and max

`static lerp(a: number, b: number, t: number): number`
- Linear interpolation

`static distance(x1: number, y1: number, x2: number, y2: number): number`
- Calculates distance between points

`static distanceSquared(x1: number, y1: number, x2: number, y2: number): number`
- Calculates squared distance (faster for comparisons)

`static normalizeAngle(angle: number): number`
- Normalizes angle to -PI to PI

`static degToRad(degrees: number): number`
- Converts degrees to radians

`static radToDeg(radians: number): number`
- Converts radians to degrees

`static random(min: number, max: number): number`
- Generates random number

`static randomInt(min: number, max: number): number`
- Generates random integer

`static pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean`
- Checks if point is inside circle

`static circlesIntersect(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean`
- Checks if two circles intersect

`static angleBetween(x1: number, y1: number, x2: number, y2: number): number`
- Calculates angle between two points

`static rotatePoint(px: number, py: number, cx: number, cy: number, angle: number): Object`
- Rotates point around center
- Returns {x, y}

`static approximately(a: number, b: number, epsilon: number): boolean`
- Checks if numbers are approximately equal

`static map(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number`
- Maps value from one range to another

#### Usage
```javascript
import { MathUtils } from './utils/MathUtils.js';

// Clamp value
const clamped = MathUtils.clamp(value, 0, 100);

// Calculate distance
const dist = MathUtils.distance(x1, y1, x2, y2);

// Rotate point
const rotated = MathUtils.rotatePoint(px, py, cx, cy, angle);

// Random number
const rand = MathUtils.random(0, 10);
```

---

### CollisionUtils.js

Collision detection utilities.

#### Static Methods

`static circlesIntersect(x1, y1, r1, x2, y2, r2): boolean`
- Circle-circle collision

`static pointInCircle(px, py, cx, cy, radius): boolean`
- Point-circle test

`static pointInRect(px, py, rx, ry, width, height): boolean`
- Point-rectangle test

`static rectsIntersect(x1, y1, w1, h1, x2, y2, w2, h2): boolean`
- Rectangle-rectangle collision

`static circleRectIntersect(cx, cy, radius, rx, ry, width, height): boolean`
- Circle-rectangle collision

`static distanceToSegment(px, py, x1, y1, x2, y2): number`
- Distance from point to line segment

`static pointInPolygon(px, py, vertices): boolean`
- Point-polygon test
- vertices: Array<{x, y}>

`static pointInHexagon(px, py, cx, cy, radius): boolean`
- Point-hexagon test

`static circleHexagonCollision(cx, cy, circleRadius, hx, hy, hexRadius): boolean`
- Circle-hexagon collision

`static segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4): boolean`
- Line segment intersection

`static closestPointOnSegment(px, py, x1, y1, x2, y2): Object`
- Returns closest point {x, y} on segment

`static polygonArea(vertices): number`
- Calculates polygon area

`static polygonsIntersect(poly1, poly2): boolean`
- Polygon-polygon intersection using SAT

#### Usage
```javascript
import { CollisionUtils } from './utils/CollisionUtils.js';

// Check circle collision
if (CollisionUtils.circlesIntersect(x1, y1, r1, x2, y2, r2)) {
  // Handle collision
}

// Check point in hexagon
if (CollisionUtils.pointInHexagon(px, py, cx, cy, radius)) {
  // Point is inside hexagon
}

// Get distance to segment
const dist = CollisionUtils.distanceToSegment(px, py, x1, y1, x2, y2);
```

---


### StorageUtils.js

localStorage management with error handling.

#### Static Methods

`static isAvailable(): boolean`
- Checks if localStorage is available

`static getItem(key: string, defaultValue: any): any`
- Gets item from localStorage
- Returns defaultValue if not found or error

`static getJSON(key: string, defaultValue: any): any`
- Gets and parses JSON from localStorage

`static setItem(key: string, value: any): boolean`
- Sets item in localStorage
- Returns true if successful

`static setJSON(key: string, value: any): boolean`
- Stringifies and sets JSON in localStorage

`static removeItem(key: string): boolean`
- Removes item from localStorage

`static clear(): boolean`
- Clears all localStorage

`static hasItem(key: string): boolean`
- Checks if key exists

`static getAllKeys(): string[]`
- Returns all localStorage keys

`static getSize(): number`
- Returns approximate size in bytes

`static getRaceMaps(): Array`
- Gets race maps from storage

`static setRaceMaps(maps: Array): boolean`
- Sets race maps in storage

`static getTankMaps(): Array`
- Gets tank maps from storage

`static setTankMaps(maps: Array): boolean`
- Sets tank maps in storage

`static getUserSettings(): Object`
- Gets user settings

`static setUserSettings(settings: Object): boolean`
- Sets user settings

`static getPlayerProgress(): Object`
- Gets player progress

`static setPlayerProgress(progress: Object): boolean`
- Sets player progress

`static backupGameData(): string|null`
- Backs up all game data to JSON string

`static restoreGameData(backupString: string): boolean`
- Restores game data from backup

`static cleanupCorruptedData(key: string): boolean`
- Cleans up corrupted data

#### Usage
```javascript
import { StorageUtils } from './utils/StorageUtils.js';

// Check availability
if (StorageUtils.isAvailable()) {
  // Set item
  StorageUtils.setJSON('gameData', { score: 100 });
  
  // Get item
  const data = StorageUtils.getJSON('gameData', {});
  
  // Backup
  const backup = StorageUtils.backupGameData();
  
  // Restore
  StorageUtils.restoreGameData(backup);
}

// Get maps
const tankMaps = StorageUtils.getTankMaps();

// Set settings
StorageUtils.setUserSettings({ volume: 0.8 });
```

---

## Asset Modules

### ImageLoader.js

Centralized image loading and asset management.

#### Class: ImageLoader (Singleton)

**Properties**
- `tankImages: Object` - Tank body images by color/body
- `weaponImages: Object` - Weapon images by color/weapon
- `lobbyTankImages: Object` - GIF images for lobby
- `lobbyWeaponImages: Object` - GIF weapons for lobby
- `shopTankImageCache: Object` - Preloaded shop images
- `imagesLoaded: boolean` - Loading complete flag
- `loadedImageCount: number` - Number of loaded images
- `totalImagesToLoad: number` - Total images to load

**Methods**

`initializeTankImages(): void`
- Initializes and starts loading all tank images

`loadGifImage(path: string, callback: Function): void`
- Loads GIF image directly

`loadImageWithFallback(basePath: string, callback: Function): void`
- Loads image with PNG/GIF fallback

`loadWeaponImagePngFirst(basePath: string, callback: Function): void`
- Loads weapon with PNG priority

`getCurrentTankImages(playerTank: Object, forLobby: boolean): Object`
- Returns {tankImg, weaponImg} for tank config

`async preloadShopTankImages(): Promise<void>`
- Preloads all shop tank images

`loadFortzCoinImage(): Image`
- Loads Fortz coin image on demand

`loadJetImage(imagePath: string): Image`
- Loads and caches jet image

`loadRaceImage(imagePath: string): Image`
- Loads and caches race image

`loadAsteroidImages(): void`
- Loads asteroid images (currently disabled)

`findWorkingDefaultTank(): Object|null`
- Finds working default tank configuration

`verifyDefaultTank(selectedTank: Object): Object`
- Verifies default tank has valid images

`getLoadingProgress(): Object`
- Returns {loaded, total, percentage, isComplete}

`loadImageWithCallback(imagePath: string, callback: Function): Image`
- Loads image with callback

`renderTankOnCanvas(canvasId: string, tankConfig: Object, options: Object): void`
- Renders tank on canvas
- options: {scale, rotation}

`renderJetOnCanvas(canvasId: string, jetConfig: Object, options: Object): void`
- Renders jet on canvas

`renderRaceOnCanvas(canvasId: string, raceConfig: Object, options: Object): void`
- Renders race car on canvas

`createFallbackImage(width: number, height: number, text: string, color: string): HTMLCanvasElement`
- Creates fallback image for failed loads

`batchLoadImages(imagePaths: Array, progressCallback: Function, completeCallback: Function): void`
- Batch loads multiple images with progress

#### Usage
```javascript
import imageLoader from './assets/ImageLoader.js';

// Initialize loading
imageLoader.initializeTankImages();

// Get images
const { tankImg, weaponImg } = imageLoader.getCurrentTankImages(playerTank, false);

// Preload shop images
await imageLoader.preloadShopTankImages();

// Get loading progress
const progress = imageLoader.getLoadingProgress();
console.log(`Loading: ${progress.percentage}%`);

// Render tank on canvas
imageLoader.renderTankOnCanvas('myCanvas', tankConfig, { scale: 0.8 });

// Batch load
imageLoader.batchLoadImages(
  ['/path1.png', '/path2.png'],
  (loaded, total) => console.log(`${loaded}/${total}`),
  (results) => console.log('Complete', results)
);
```

---

## Common Patterns

### Module Import Pattern

```javascript
// Import specific exports
import { TANK_CONFIG, PHYSICS_CONFIG } from './core/Config.js';

// Import default export
import gameStateManager from './core/GameState.js';

// Import class
import { MathUtils } from './utils/MathUtils.js';
```

### State Update Pattern

```javascript
// Get state
const state = gameStateManager.getGameState();

// Update state
gameStateManager.updateGameState({
  isInLobby: false,
  playerId: 'player1'
});

// Listen to changes
gameStateManager.addListener('gameState', 'myId', (oldState, newState) => {
  if (oldState.isInLobby !== newState.isInLobby) {
    console.log('Lobby state changed');
  }
});
```

### System Initialization Pattern

```javascript
// Create system
const system = new SystemClass(dependencies);

// Initialize
system.initialize();

// Update loop
function gameLoop() {
  system.update(deltaTime);
  requestAnimationFrame(gameLoop);
}

// Cleanup
system.cleanup();
```

### Error Handling Pattern

```javascript
try {
  // Operation that might fail
  const result = StorageUtils.getJSON('key', {});
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error gracefully
}
```

---

## Type Definitions

### Common Types

```typescript
// Position
interface Position {
  x: number;
  y: number;
}

// Velocity
interface Velocity {
  x: number;
  y: number;
}

// Tank Configuration
interface TankConfig {
  color: string;
  body: string;
  weapon: string;
}

// Player Data
interface PlayerData {
  id: string;
  x: number;
  y: number;
  rotation: number;
  velocity: Velocity;
  health: number;
  selectedTank: TankConfig;
  isAlive: boolean;
  score: number;
}

// Bullet Data
interface BulletData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  ownerId: string;
  color: string;
  damage: number;
  createdAt: number;
}

// Input State
interface InputState {
  keys: { [key: string]: boolean };
  mouse: {
    x: number;
    y: number;
    down: boolean;
    angle: number;
  };
  touch: {
    x: number;
    y: number;
    active: boolean;
  };
}
```

---

## Best Practices

### Module Usage

1. **Import what you need**: Only import required exports
2. **Use const for imports**: Imports should be immutable
3. **Organize imports**: Group by type (core, systems, utils)
4. **Avoid circular dependencies**: Keep dependency graph acyclic

### State Management

1. **Use GameStateManager**: Don't modify state directly
2. **Subscribe to changes**: Use listeners for reactive updates
3. **Batch updates**: Update multiple properties at once
4. **Clean up listeners**: Remove listeners when done

### Performance

1. **Reuse objects**: Avoid creating new objects in loops
2. **Use object pooling**: For particles and bullets
3. **Cache calculations**: Store expensive calculations
4. **Limit updates**: Only update what changed

### Error Handling

1. **Check availability**: Verify resources before use
2. **Provide defaults**: Always have fallback values
3. **Log errors**: Use console.error for debugging
4. **Fail gracefully**: Don't crash on errors

---

## Migration Guide

### From Global to Modules

**Before (Global)**:
```javascript
// Access global state
window.gameState.isInLobby = false;

// Call global function
window.sendToServer('move', data);
```

**After (Modules)**:
```javascript
// Import module
import gameStateManager from './core/GameState.js';
import networkSystem from './systems/NetworkSystem.js';

// Use module API
gameStateManager.updateGameState({ isInLobby: false });
networkSystem.sendToServer('move', data);
```

### Updating Existing Code

1. Identify global dependencies
2. Import required modules
3. Replace global access with module API
4. Test thoroughly
5. Remove global references

---

## Troubleshooting

### Module Not Found

**Problem**: `Cannot find module './core/Config.js'`

**Solution**: Check import path is relative to current file

### Circular Dependency

**Problem**: Module A imports B, B imports A

**Solution**: Refactor to remove circular dependency or use dependency injection

### State Not Updating

**Problem**: State changes don't trigger updates

**Solution**: Use `gameStateManager.updateGameState()` instead of direct modification

### Images Not Loading

**Problem**: Tank images show as blank

**Solution**: Check `imageLoader.getLoadingProgress()` and verify image paths

---

## Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Requirements Document](../.kiro/specs/game-refactoring/requirements.md)
- [Design Document](../.kiro/specs/game-refactoring/design.md)
- [Quick Start Guide](./QUICKSTART.md)

---

*Last Updated: December 2024*
