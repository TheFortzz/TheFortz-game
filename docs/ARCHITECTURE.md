# Game Architecture Documentation

## Overview

This document describes the modular architecture of the game codebase after the refactoring from a monolithic 10,000+ line game.js file into a well-organized, maintainable structure.

## Architecture Principles

The refactored architecture follows these key principles:

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Modularity**: Code is organized into logical, reusable modules
3. **Dependency Management**: Clear import/export patterns with no circular dependencies
4. **State Centralization**: Single source of truth for game state
5. **Backward Compatibility**: Maintains compatibility with existing code through global exports where necessary

## Directory Structure

```
src/client/js/
├── game.js                    # Main coordinator (<500 lines)
├── core/                      # Core game systems
│   ├── Config.js             # All game constants and configuration
│   ├── GameState.js          # Centralized state management
│   ├── GameLoop.js           # Main game loop coordination
│   └── ModuleManager.js      # Module initialization and coordination
├── systems/                   # Game systems
│   ├── RenderSystem.js       # All rendering logic
│   ├── InputSystem.js        # Input handling and controls
│   ├── NetworkSystem.js      # Socket communication
│   ├── PhysicsSystem.js      # Movement and collision
│   ├── WeaponSystem.js       # Shooting and combat
│   └── ParticleSystem.js     # Visual effects
├── entities/                  # Game entities
│   ├── Player.js             # Player-specific logic
│   ├── Tank.js               # Tank behavior and rendering
│   └── Bullet.js             # Bullet physics and rendering
├── ui/                        # UI components
│   ├── LobbyUI.js            # Lobby interface management
│   ├── ShopUI.js             # Shop system
│   ├── LockerUI.js           # Locker/customization system
│   └── Auth.js               # Authentication UI
├── assets/                    # Asset management
│   └── ImageLoader.js        # Image loading and caching
├── utils/                     # Utility functions
│   ├── MathUtils.js          # Mathematical utilities
│   ├── CollisionUtils.js     # Collision detection helpers
│   └── StorageUtils.js       # localStorage management
└── tests/                     # Property-based tests
    ├── module-organization.test.js
    ├── code-duplication-elimination.test.js
    ├── dependency-graph-acyclicity.test.js
    └── ... (other property tests)
```

## Core Modules

### Config.js

**Purpose**: Centralized configuration and constants

**Exports**:
- `TANK_CONFIG`: Tank colors, bodies, weapons, and prices
- `PHYSICS_CONFIG`: Physics constants (speed, acceleration, etc.)
- `NETWORK_CONFIG`: Network settings
- `UI_CONFIG`: UI configuration
- `STORAGE_KEYS`: localStorage key constants
- `DEFAULT_GAME_STATE`: Default game state structure

**Usage**:
```javascript
import { TANK_CONFIG, PHYSICS_CONFIG } from './core/Config.js';
```

### GameState.js

**Purpose**: Centralized state management with listener pattern

**Key Features**:
- Single source of truth for all game state
- State change listeners for reactive updates
- Player management (add, remove, update)
- Backward compatibility through global window.gameState

**API**:
```javascript
import gameStateManager from './core/GameState.js';

// Get state
const state = gameStateManager.getGameState();

// Update state
gameStateManager.updateGameState({ isInLobby: false });

// Listen to changes
gameStateManager.addListener('gameState', 'myListener', (oldState, newState) => {
  console.log('State changed:', newState);
});
```

### GameLoop.js

**Purpose**: Main game loop coordination

**Responsibilities**:
- Orchestrates system updates in correct order
- Manages animation frame requests
- Handles delta time calculations
- Coordinates render calls

**Update Order**:
1. InputSystem
2. PhysicsSystem
3. ParticleSystem
4. WeaponSystem
5. RenderSystem

### ModuleManager.js

**Purpose**: Module initialization and lifecycle management

**API**:
```javascript
import moduleManager from './core/ModuleManager.js';

// Initialize all modules
await moduleManager.initialize(canvas);

// Start game systems
moduleManager.start();

// Get specific system
const renderSystem = moduleManager.getSystem('render');

// Cleanup
moduleManager.cleanup();
```

## System Modules

### RenderSystem.js

**Purpose**: Centralized rendering for all game visuals

**Responsibilities**:
- Canvas management
- Player rendering
- AI tank rendering
- Particle effect rendering
- Lobby background rendering
- Notification system

**Key Methods**:
- `render()`: Main render function
- `renderLobbyBackground()`: Render lobby
- `drawPlayers()`: Draw player tanks
- `drawAITanks()`: Draw AI opponents

### InputSystem.js

**Purpose**: Input handling and event management

**Handles**:
- Keyboard input (WASD, arrow keys, special keys)
- Mouse input (movement, clicks, wheel)
- Touch input
- Game-specific features (sprint, auto-fire, aimbot)

**Key Methods**:
- `setupInputHandlers()`: Initialize event listeners
- `getMovementInput()`: Get WASD/arrow key input
- `handleShooting()`: Process shooting input
- `getInputState()`: Get complete input state

### NetworkSystem.js

**Purpose**: WebSocket communication with game server

**Responsibilities**:
- Connection management
- Message handling
- Player synchronization
- Movement updates
- Shooting events
- Power-up collection

**Key Methods**:
- `connectToServer(gameMode)`: Connect to server
- `sendToServer(type, data)`: Send message
- `handleServerMessage(data)`: Process server messages
- `startMovementUpdates()`: Begin sending position updates

### PhysicsSystem.js

**Purpose**: Tank movement, collision, and physics

**Features**:
- Tank acceleration and deceleration
- Sprint system with stamina
- Collision detection (walls, hexagons)
- Camera following
- Recoil physics
- Smooth interpolation

**Key Methods**:
- `updateTankPhysics(inputX, inputY)`: Update tank movement
- `isNearWall(x, y)`: Check wall collision
- `updateCamera(player)`: Update camera position
- `applyRecoil(vx, vy, duration)`: Apply recoil force

### WeaponSystem.js

**Purpose**: Weapon behavior, shooting, and animations

**Features**:
- Shooting cooldown management
- Gun recoil animations
- Muzzle flash effects
- Weapon sprite animations
- Bullet color schemes
- Shop tank rendering

**Key Methods**:
- `handleShooting(currentTime, activePowerUps)`: Process shooting
- `triggerWeaponAnimation(playerTank, playerId)`: Start weapon animation
- `getTankStats(weapon, color)`: Get weapon statistics
- `renderShopTankPreview(canvas, color, weapon)`: Render shop preview

### ParticleSystem.js

**Purpose**: Visual effects and particle management

**Particle Types**:
- Bullet trails
- Explosions
- Impact particles
- Exhaust smoke
- Muzzle flashes
- Weather effects (rain, snow)
- Hit markers

**Key Methods**:
- `update()`: Update all particles
- `render()`: Render all particles
- `createExplosion(x, y, size)`: Create explosion
- `createBulletTrail(bullet)`: Create bullet trail
- `toggleWeather(type)`: Toggle weather system

## Entity Modules

### Player.js

**Purpose**: Player entity with game logic

**Properties**:
- Position (x, y)
- Velocity
- Health
- Tank configuration
- Score, kills, deaths

**Key Methods**:
- `update(deltaTime, inputState)`: Update player
- `shoot()`: Attempt to shoot
- `takeDamage(damage)`: Take damage
- `respawn(x, y)`: Respawn player
- `serialize()`: Serialize for network

### Tank.js

**Purpose**: Tank rendering and configuration

**Responsibilities**:
- Tank configuration management
- Body and weapon rendering
- Sprite animation support
- Asset key generation

**Key Methods**:
- `render(ctx, images, options)`: Render complete tank
- `renderBody(ctx, tankImg, options)`: Render tank body
- `renderWeapon(ctx, weaponImg, options)`: Render weapon
- `getStats()`: Get tank statistics

### Bullet.js

**Purpose**: Bullet physics and rendering

**Features**:
- Position and velocity tracking
- Lifetime management
- Collision detection
- Visual effects (trails, glow)
- Damage calculation

**Key Methods**:
- `update(deltaTime)`: Update bullet position
- `render(ctx, bulletColors)`: Render bullet
- `checkCollision(x, y, radius)`: Check collision
- `isExpired()`: Check if bullet expired

## Utility Modules

### MathUtils.js

**Purpose**: Common mathematical operations

**Functions**:
- `clamp(value, min, max)`: Clamp value
- `lerp(a, b, t)`: Linear interpolation
- `distance(x1, y1, x2, y2)`: Calculate distance
- `normalizeAngle(angle)`: Normalize angle
- `degToRad(degrees)`: Convert degrees to radians
- `random(min, max)`: Random number
- `circlesIntersect(...)`: Circle intersection test
- `rotatePoint(...)`: Rotate point around center

### CollisionUtils.js

**Purpose**: Collision detection utilities

**Functions**:
- `circlesIntersect(...)`: Circle-circle collision
- `pointInCircle(...)`: Point-circle test
- `pointInRect(...)`: Point-rectangle test
- `rectsIntersect(...)`: Rectangle-rectangle collision
- `circleRectIntersect(...)`: Circle-rectangle collision
- `distanceToSegment(...)`: Point-to-line distance
- `pointInPolygon(...)`: Point-polygon test
- `pointInHexagon(...)`: Point-hexagon test
- `circleHexagonCollision(...)`: Circle-hexagon collision

### StorageUtils.js

**Purpose**: localStorage management with error handling

**Features**:
- Safe localStorage operations
- JSON serialization/deserialization
- Game data backup/restore
- Quota exceeded handling
- Corrupted data cleanup

**Key Methods**:
- `getItem(key, defaultValue)`: Get item
- `setItem(key, value)`: Set item
- `getJSON(key, defaultValue)`: Get JSON
- `setJSON(key, value)`: Set JSON
- `getRaceMaps()`: Get race maps
- `setTankMaps(maps)`: Set tank maps
- `backupGameData()`: Backup all data
- `restoreGameData(backupString)`: Restore from backup

### ImageLoader.js

**Purpose**: Centralized image loading and asset management

**Features**:
- Tank image loading (PNG/GIF)
- Weapon image loading
- Lobby preview images
- Shop image preloading
- Loading progress tracking
- Fallback image generation

**Key Methods**:
- `initializeTankImages()`: Load all tank images
- `getCurrentTankImages(playerTank, forLobby)`: Get tank images
- `preloadShopTankImages()`: Preload shop images
- `renderTankOnCanvas(canvasId, tankConfig)`: Render tank
- `getLoadingProgress()`: Get loading status

## Data Flow

### Game Initialization

```
1. ModuleManager.initialize(canvas)
   ├── Create system instances
   ├── Initialize RenderSystem
   ├── Initialize InputSystem
   ├── Initialize NetworkSystem
   └── Register systems with GameLoop

2. ImageLoader.initializeTankImages()
   ├── Load tank body images
   ├── Load weapon images
   └── Track loading progress

3. GameLoop.start()
   └── Begin animation loop
```

### Game Loop Flow

```
requestAnimationFrame
  ├── Calculate deltaTime
  ├── InputSystem.update()
  │   └── Process keyboard/mouse input
  ├── PhysicsSystem.update()
  │   ├── Update tank physics
  │   ├── Check collisions
  │   └── Update camera
  ├── ParticleSystem.update()
  │   └── Update all particles
  ├── WeaponSystem.update()
  │   ├── Update recoil animations
  │   └── Update weapon animations
  └── RenderSystem.render()
      ├── Clear canvas
      ├── Apply camera transform
      ├── Render map
      ├── Render players
      ├── Render particles
      └── Render UI
```

### Network Communication

```
Client                          Server
  │                               │
  ├─ connectToServer() ──────────>│
  │<──────────── gameState ───────┤
  │                               │
  ├─ sendMovementUpdates() ──────>│
  │   (every 33ms)                │
  │<──────── playerUpdate ────────┤
  │                               │
  ├─ sendPlayerShoot() ──────────>│
  │<──────── bulletFired ─────────┤
  │                               │
  └─ handleServerMessage() ───────┤
      ├── playerUpdate            │
      ├── bulletFired             │
      ├── scoreUpdate             │
      └── playerDamaged           │
```

## State Management

### GameState Structure

```javascript
{
  // Core game state
  isInLobby: boolean,
  isConnected: boolean,
  playerId: string,
  clientId: string,
  
  // Players
  players: Map<string, Player>,
  
  // Game world
  shapes: Array<Shape>,
  walls: Array<Wall>,
  bullets: Array<Bullet>,
  gameWidth: number,
  gameHeight: number,
  
  // Camera
  camera: {
    x: number,
    y: number,
    zoom: number
  },
  
  // Input
  keys: Object,
  mouse: {
    x: number,
    y: number,
    angle: number
  },
  
  // Player customization
  selectedTank: {
    color: string,
    body: string,
    weapon: string
  },
  
  // Currency and ownership
  fortzCurrency: number,
  ownedItems: {
    colors: Array<string>,
    bodies: Array<string>,
    weapons: Array<string>
  },
  
  // UI state
  showShop: boolean,
  showLocker: boolean,
  showSettings: boolean,
  
  // Settings
  settings: {
    sound: Object,
    graphics: Object,
    controls: Object
  }
}
```

## Module Communication

### Direct Dependencies

```
game.js
  ├── ModuleManager
  │   ├── GameStateManager
  │   ├── GameLoop
  │   ├── RenderSystem
  │   ├── InputSystem
  │   └── NetworkSystem
  │
  ├── PhysicsSystem
  │   └── GameStateManager
  │
  ├── WeaponSystem
  │   ├── GameStateManager
  │   ├── NetworkSystem
  │   ├── ParticleSystem
  │   └── ImageLoader
  │
  └── ParticleSystem
      └── GameStateManager
```

### Event-Based Communication

Systems communicate through:
1. **GameState updates**: Systems read/write to centralized state
2. **Event listeners**: GameStateManager notifies listeners of changes
3. **Direct method calls**: Systems call methods on other systems when needed
4. **Global functions**: Backward compatibility through window object

## Testing Strategy

### Property-Based Testing

The codebase uses property-based testing with the `fast-check` library to verify correctness properties:

1. **Module Organization Completeness** (Property 1)
   - Validates all functionality is in appropriate modules

2. **Code Duplication Elimination** (Property 2)
   - Ensures no duplicate function implementations

3. **Dependency Graph Acyclicity** (Property 3)
   - Verifies no circular dependencies

4. **Import/Export Consistency** (Property 4)
   - Checks explicit imports instead of globals

5. **Main File Size Constraint** (Property 5)
   - Ensures game.js stays under 500 lines

6. **Constant Consolidation** (Property 6)
   - Validates constants defined once in Config

7. **Naming Convention Consistency** (Property 7)
   - Checks consistent naming patterns

8. **Functional Preservation** (Property 8)
   - Ensures refactoring didn't break features

9. **Export Pattern Uniformity** (Property 9)
   - Validates consistent export patterns

10. **State Centralization** (Property 10)
    - Checks state access through GameState module

### Running Tests

```bash
# Run all property-based tests
npm test

# Run specific test
npm test -- module-organization.test.js

# Run with coverage
npm test -- --coverage
```

## Performance Considerations

### Optimization Strategies

1. **Object Pooling**: Reuse particle objects instead of creating new ones
2. **Spatial Partitioning**: Use quadtrees for collision detection (future enhancement)
3. **Render Culling**: Only render entities within camera view
4. **Delta Time**: Frame-rate independent physics
5. **Request Animation Frame**: Smooth 60fps rendering
6. **Image Caching**: Preload and cache all images
7. **Lazy Loading**: Load assets on demand when possible

### Performance Metrics

- Target: 60 FPS
- Max particles: 500 (weather) + dynamic game particles
- Network updates: 30 per second (33ms interval)
- Physics updates: Every frame
- Render updates: Every frame

## Backward Compatibility

### Global Exports

For backward compatibility with existing code, certain objects are exposed globally:

```javascript
// GameState
window.gameState = gameStateManager.getGameState();

// Input state
window.tankVelocity = physicsSystem.tankVelocity;
window.isSprinting = inputSystem.isSprinting;

// Images
window.tankImages = imageLoader.tankImages;
window.weaponImages = imageLoader.weaponImages;

// Functions
window.sendToServer = networkSystem.sendToServer;
window.createExplosion = particleSystem.createExplosion;
```

### Migration Path

To fully migrate away from globals:

1. Import modules directly: `import gameStateManager from './core/GameState.js'`
2. Use module APIs instead of globals
3. Remove global references gradually
4. Update tests to use module imports

## Future Enhancements

### Planned Improvements

1. **TypeScript Migration**: Add type safety
2. **ECS Architecture**: Entity Component System for better performance
3. **Web Workers**: Offload physics to separate thread
4. **Asset Bundling**: Webpack/Vite for optimized builds
5. **State Persistence**: Better save/load system
6. **Replay System**: Record and playback games
7. **Mod Support**: Plugin architecture for extensions

### Scalability

The modular architecture supports:
- Easy addition of new game modes
- New vehicle types (jets, race cars)
- Additional weapon systems
- New particle effects
- Extended UI features
- Multiple map types

## Troubleshooting

### Common Issues

**Images not loading**:
- Check ImageLoader.getLoadingProgress()
- Verify image paths in Config.js
- Check browser console for 404 errors

**State not updating**:
- Ensure using gameStateManager.updateGameState()
- Check if listeners are registered
- Verify state changes in browser devtools

**Network issues**:
- Check WebSocket connection status
- Verify server URL in NetworkSystem
- Monitor network tab for messages

**Performance problems**:
- Check particle count (ParticleSystem.getStats())
- Monitor FPS in browser devtools
- Reduce graphics quality in settings

## Contributing

### Code Style

- Use ES6+ features (classes, arrow functions, destructuring)
- Follow existing naming conventions
- Add JSDoc comments to all public methods
- Keep functions small and focused
- Avoid global variables (use modules)

### Adding New Features

1. Determine appropriate module location
2. Create new module if needed
3. Add to ModuleManager if it's a system
4. Update Config.js for new constants
5. Add property-based tests
6. Update this documentation

### Module Guidelines

- **Single Responsibility**: Each module has one clear purpose
- **Explicit Dependencies**: Import what you need
- **No Circular Dependencies**: Keep dependency graph acyclic
- **Backward Compatibility**: Maintain global exports if needed
- **Error Handling**: Handle errors gracefully
- **Documentation**: Add JSDoc comments

## References

### External Libraries

- **fast-check**: Property-based testing framework
- **WebSocket**: Real-time communication
- **Canvas API**: 2D rendering

### Related Documentation

- [Requirements Document](../.kiro/specs/game-refactoring/requirements.md)
- [Design Document](../.kiro/specs/game-refactoring/design.md)
- [Task List](../.kiro/specs/game-refactoring/tasks.md)
- [Quick Start Guide](./QUICKSTART.md)
- [Start Playing](./START_PLAYING.md)

## Conclusion

The refactored architecture provides a solid foundation for future development. The modular structure makes the codebase:

- **Maintainable**: Easy to find and fix bugs
- **Testable**: Property-based tests verify correctness
- **Extensible**: Simple to add new features
- **Performant**: Optimized rendering and physics
- **Documented**: Clear API documentation

The architecture successfully transformed a 10,000+ line monolithic file into a well-organized, professional codebase while maintaining all existing functionality.
