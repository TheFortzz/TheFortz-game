/**
 * Game State Type Definitions
 * 
 * This module defines all type definitions for the game state management system.
 * While JavaScript doesn't have native types, we use JSDoc annotations for
 * documentation and IDE support, plus factory functions for creating valid objects.
 * 
 * @module state/types
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * @typedef {Object} TankConfig
 * @property {string} bodyType - Tank body type identifier
 * @property {string} color - Tank color
 * @property {string} weaponType - Weapon type identifier
 */

/**
 * @typedef {Object} Velocity
 * @property {number} x - Horizontal velocity
 * @property {number} y - Vertical velocity
 */

/**
 * @typedef {Object} Player
 * @property {string} id - Unique player identifier
 * @property {number} x - X position on map
 * @property {number} y - Y position on map
 * @property {number} angle - Tank body rotation angle in radians
 * @property {number} turretAngle - Turret rotation angle in radians
 * @property {number} health - Current health points
 * @property {number} maxHealth - Maximum health points
 * @property {number} shield - Current shield points
 * @property {number} maxShield - Maximum shield points
 * @property {string} team - Team identifier
 * @property {TankConfig} selectedTank - Tank configuration
 * @property {Velocity} velocity - Current velocity
 * @property {number} lastUpdate - Timestamp of last update
 */

/**
 * @typedef {Object} Bullet
 * @property {string} id - Unique bullet identifier
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} vx - X velocity
 * @property {number} vy - Y velocity
 * @property {string} ownerId - ID of player who fired the bullet
 * @property {number} damage - Damage amount
 * @property {number} createdAt - Creation timestamp
 * @property {number} ttl - Time to live in milliseconds
 */


/**
 * @typedef {Object} PowerUp
 * @property {string} id - Unique powerup identifier
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {string} type - Powerup type (health, speed, damage, shield, etc.)
 * @property {number} value - Effect value
 * @property {number} duration - Effect duration in milliseconds (0 for instant)
 * @property {number} spawnedAt - Spawn timestamp
 */

// ============================================================================
// STATE SLICE TYPES
// ============================================================================

/**
 * @typedef {Object} PlayersSlice
 * @property {Object.<string, Player>} byId - Players indexed by ID
 * @property {string|null} localPlayerId - ID of the local player
 * @property {string[]} allIds - Array of all player IDs
 */

/**
 * @typedef {Object} BulletsSlice
 * @property {Object.<string, Bullet>} byId - Bullets indexed by ID
 * @property {string[]} allIds - Array of all bullet IDs
 */

/**
 * @typedef {Object} PowerupsSlice
 * @property {Object.<string, PowerUp>} byId - Powerups indexed by ID
 * @property {string[]} allIds - Array of all powerup IDs
 */

/**
 * @typedef {Object} MapSlice
 * @property {string} id - Map identifier
 * @property {number} width - Map width in pixels
 * @property {number} height - Map height in pixels
 * @property {string} type - Map type (tank, race, jet)
 * @property {Array} obstacles - Array of obstacle objects
 * @property {Array} spawnPoints - Array of spawn point coordinates
 */

/**
 * @typedef {Object} WeatherSlice
 * @property {string} type - Weather type (clear, rain, snow, fog, etc.)
 * @property {number} intensity - Weather intensity (0-1)
 * @property {number} windSpeed - Wind speed
 * @property {number} windDirection - Wind direction in radians
 */

/**
 * @typedef {Object} UISlice
 * @property {string} currentScreen - Current screen identifier
 * @property {boolean} isPaused - Whether game is paused
 * @property {boolean} showMinimap - Whether minimap is visible
 * @property {boolean} showChat - Whether chat is visible
 * @property {string[]} notifications - Active notification messages
 * @property {Object|null} modal - Current modal state
 */

/**
 * @typedef {Object} SoundSettings
 * @property {number} master - Master volume (0-1)
 * @property {number} effects - Effects volume (0-1)
 * @property {number} music - Music volume (0-1)
 */

/**
 * @typedef {Object} GraphicsSettings
 * @property {'low'|'medium'|'high'|'ultra'} quality - Graphics quality level
 * @property {boolean} particles - Whether particles are enabled
 * @property {boolean} shadows - Whether shadows are enabled
 */

/**
 * @typedef {Object} SettingsSlice
 * @property {SoundSettings} sound - Sound settings
 * @property {GraphicsSettings} graphics - Graphics settings
 * @property {Object.<string, string>} controls - Key bindings
 */

/**
 * @typedef {Object} OwnedItems
 * @property {string[]} colors - Owned color IDs
 * @property {string[]} bodies - Owned body IDs
 * @property {string[]} weapons - Owned weapon IDs
 */

/**
 * @typedef {Object} PlayerStats
 * @property {number} kills - Total kills
 * @property {number} deaths - Total deaths
 * @property {number} gamesPlayed - Total games played
 */

/**
 * @typedef {Object} ProgressionSlice
 * @property {number} currency - Current currency amount
 * @property {OwnedItems} ownedItems - Owned items
 * @property {string[]} achievements - Unlocked achievement IDs
 * @property {PlayerStats} stats - Player statistics
 */

/**
 * @typedef {Object} MetaSlice
 * @property {string} version - State version for migrations
 * @property {number} lastSaved - Last save timestamp
 * @property {string} sessionId - Current session identifier
 */


// ============================================================================
// GAME STATE TYPE
// ============================================================================

/**
 * @typedef {Object} GameState
 * @property {PlayersSlice} players - Players state slice
 * @property {BulletsSlice} bullets - Bullets state slice
 * @property {PowerupsSlice} powerups - Powerups state slice
 * @property {MapSlice} map - Map state slice
 * @property {WeatherSlice} weather - Weather state slice
 * @property {UISlice} ui - UI state slice
 * @property {SettingsSlice} settings - Settings state slice (persistent)
 * @property {ProgressionSlice} progression - Progression state slice (persistent)
 * @property {MetaSlice} meta - Metadata slice
 */

// ============================================================================
// ACTION TYPES
// ============================================================================

/**
 * @typedef {Object} StateAction
 * @property {string} type - Action type identifier
 * @property {*} payload - Action payload data
 * @property {number} timestamp - Action timestamp
 * @property {'local'|'server'} source - Action source
 * @property {boolean} [optimistic] - Whether this is an optimistic update
 */

// Player action types
export const PLAYER_ACTIONS = {
  PLAYER_ADD: 'PLAYER_ADD',
  PLAYER_REMOVE: 'PLAYER_REMOVE',
  PLAYER_MOVE: 'PLAYER_MOVE',
  PLAYER_DAMAGE: 'PLAYER_DAMAGE',
  PLAYER_HEAL: 'PLAYER_HEAL',
  PLAYER_SET_HEALTH: 'PLAYER_SET_HEALTH',
  PLAYER_UPDATE: 'PLAYER_UPDATE',
};

// Bullet action types
export const BULLET_ACTIONS = {
  BULLET_CREATE: 'BULLET_CREATE',
  BULLET_REMOVE: 'BULLET_REMOVE',
  BULLET_UPDATE: 'BULLET_UPDATE',
  BULLETS_CLEAR: 'BULLETS_CLEAR',
};

// Powerup action types
export const POWERUP_ACTIONS = {
  POWERUP_SPAWN: 'POWERUP_SPAWN',
  POWERUP_COLLECT: 'POWERUP_COLLECT',
  POWERUP_REMOVE: 'POWERUP_REMOVE',
  POWERUPS_CLEAR: 'POWERUPS_CLEAR',
};

// Map action types
export const MAP_ACTIONS = {
  MAP_LOAD: 'MAP_LOAD',
  MAP_UPDATE: 'MAP_UPDATE',
};

// Weather action types
export const WEATHER_ACTIONS = {
  WEATHER_SET: 'WEATHER_SET',
  WEATHER_UPDATE: 'WEATHER_UPDATE',
};

// UI action types
export const UI_ACTIONS = {
  UI_SET_SCREEN: 'UI_SET_SCREEN',
  UI_TOGGLE_PAUSE: 'UI_TOGGLE_PAUSE',
  UI_SHOW_NOTIFICATION: 'UI_SHOW_NOTIFICATION',
  UI_DISMISS_NOTIFICATION: 'UI_DISMISS_NOTIFICATION',
  UI_SET_MODAL: 'UI_SET_MODAL',
  UI_CLOSE_MODAL: 'UI_CLOSE_MODAL',
};

// Settings action types
export const SETTINGS_ACTIONS = {
  SETTINGS_UPDATE_SOUND: 'SETTINGS_UPDATE_SOUND',
  SETTINGS_UPDATE_GRAPHICS: 'SETTINGS_UPDATE_GRAPHICS',
  SETTINGS_UPDATE_CONTROLS: 'SETTINGS_UPDATE_CONTROLS',
  SETTINGS_RESET: 'SETTINGS_RESET',
};

// Progression action types
export const PROGRESSION_ACTIONS = {
  PROGRESSION_ADD_CURRENCY: 'PROGRESSION_ADD_CURRENCY',
  PROGRESSION_SPEND_CURRENCY: 'PROGRESSION_SPEND_CURRENCY',
  PROGRESSION_UNLOCK_ITEM: 'PROGRESSION_UNLOCK_ITEM',
  PROGRESSION_ADD_ACHIEVEMENT: 'PROGRESSION_ADD_ACHIEVEMENT',
  PROGRESSION_UPDATE_STATS: 'PROGRESSION_UPDATE_STATS',
};

// Meta action types
export const META_ACTIONS = {
  META_UPDATE: 'META_UPDATE',
  META_SET_SESSION: 'META_SET_SESSION',
};

// State management action types
export const STATE_ACTIONS = {
  STATE_RESET: 'STATE_RESET',
  STATE_RESTORE: 'STATE_RESTORE',
  STATE_MERGE: 'STATE_MERGE',
};

// All action types combined
export const ACTION_TYPES = {
  ...PLAYER_ACTIONS,
  ...BULLET_ACTIONS,
  ...POWERUP_ACTIONS,
  ...MAP_ACTIONS,
  ...WEATHER_ACTIONS,
  ...UI_ACTIONS,
  ...SETTINGS_ACTIONS,
  ...PROGRESSION_ACTIONS,
  ...META_ACTIONS,
  ...STATE_ACTIONS,
};


// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * @typedef {Object} ValidationError
 * @property {string} path - Path to the invalid value (e.g., 'players.byId.player1.health')
 * @property {string} message - Human-readable error message
 * @property {*} value - The invalid value
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {ValidationError[]} errors - Array of validation errors
 */

// ============================================================================
// SNAPSHOT TYPES
// ============================================================================

/**
 * @typedef {Object} StateSnapshot
 * @property {GameState} state - The complete game state
 * @property {number} timestamp - Snapshot creation timestamp
 * @property {string} version - State version for compatibility
 * @property {string} checksum - Integrity checksum
 */

// ============================================================================
// SUBSCRIBER TYPES
// ============================================================================

/**
 * @callback StateSubscriber
 * @param {GameState} newState - The new state after change
 * @param {GameState} prevState - The previous state before change
 * @returns {void}
 */

/**
 * @callback SliceSubscriber
 * @param {*} newSlice - The new slice value after change
 * @param {*} prevSlice - The previous slice value before change
 * @returns {void}
 */

// ============================================================================
// DEFAULT VALUES / FACTORY FUNCTIONS
// ============================================================================

/**
 * Current state version for migrations
 */
export const STATE_VERSION = '1.0.0';

/**
 * List of slices that should be persisted to localStorage
 */
export const PERSISTENT_SLICES = ['settings', 'progression'];

/**
 * Creates a default TankConfig
 * @returns {TankConfig}
 */
export function createDefaultTankConfig() {
  return {
    bodyType: 'body_halftrack',
    color: 'blue',
    weaponType: 'turret_01_mk1',
  };
}

/**
 * Creates a default Player
 * @param {string} id - Player ID
 * @param {Partial<Player>} [overrides] - Optional property overrides
 * @returns {Player}
 */
export function createPlayer(id, overrides = {}) {
  return {
    id,
    x: 0,
    y: 0,
    angle: 0,
    turretAngle: 0,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 50,
    team: 'none',
    selectedTank: createDefaultTankConfig(),
    velocity: { x: 0, y: 0 },
    lastUpdate: Date.now(),
    ...overrides,
  };
}

/**
 * Creates a default Bullet
 * @param {string} id - Bullet ID
 * @param {string} ownerId - Owner player ID
 * @param {Partial<Bullet>} [overrides] - Optional property overrides
 * @returns {Bullet}
 */
export function createBullet(id, ownerId, overrides = {}) {
  return {
    id,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ownerId,
    damage: 10,
    createdAt: Date.now(),
    ttl: 3000,
    ...overrides,
  };
}

/**
 * Creates a default PowerUp
 * @param {string} id - PowerUp ID
 * @param {string} type - PowerUp type
 * @param {Partial<PowerUp>} [overrides] - Optional property overrides
 * @returns {PowerUp}
 */
export function createPowerUp(id, type, overrides = {}) {
  return {
    id,
    x: 0,
    y: 0,
    type,
    value: 25,
    duration: 0,
    spawnedAt: Date.now(),
    ...overrides,
  };
}


/**
 * Creates a default PlayersSlice
 * @returns {PlayersSlice}
 */
export function createPlayersSlice() {
  return {
    byId: {},
    localPlayerId: null,
    allIds: [],
  };
}

/**
 * Creates a default BulletsSlice
 * @returns {BulletsSlice}
 */
export function createBulletsSlice() {
  return {
    byId: {},
    allIds: [],
  };
}

/**
 * Creates a default PowerupsSlice
 * @returns {PowerupsSlice}
 */
export function createPowerupsSlice() {
  return {
    byId: {},
    allIds: [],
  };
}

/**
 * Creates a default MapSlice
 * @param {Partial<MapSlice>} [overrides] - Optional property overrides
 * @returns {MapSlice}
 */
export function createMapSlice(overrides = {}) {
  return {
    id: 'default',
    width: 2000,
    height: 2000,
    type: 'tank',
    obstacles: [],
    spawnPoints: [],
    ...overrides,
  };
}

/**
 * Creates a default WeatherSlice
 * @returns {WeatherSlice}
 */
export function createWeatherSlice() {
  return {
    type: 'clear',
    intensity: 0,
    windSpeed: 0,
    windDirection: 0,
  };
}

/**
 * Creates a default UISlice
 * @returns {UISlice}
 */
export function createUISlice() {
  return {
    currentScreen: 'menu',
    isPaused: false,
    showMinimap: true,
    showChat: false,
    notifications: [],
    modal: null,
  };
}

/**
 * Creates default SoundSettings
 * @returns {SoundSettings}
 */
export function createSoundSettings() {
  return {
    master: 0.8,
    effects: 0.8,
    music: 0.5,
  };
}

/**
 * Creates default GraphicsSettings
 * @returns {GraphicsSettings}
 */
export function createGraphicsSettings() {
  return {
    quality: 'medium',
    particles: true,
    shadows: true,
  };
}

/**
 * Creates a default SettingsSlice
 * @returns {SettingsSlice}
 */
export function createSettingsSlice() {
  return {
    sound: createSoundSettings(),
    graphics: createGraphicsSettings(),
    controls: {
      moveUp: 'KeyW',
      moveDown: 'KeyS',
      moveLeft: 'KeyA',
      moveRight: 'KeyD',
      fire: 'Mouse0',
      reload: 'KeyR',
      pause: 'Escape',
    },
  };
}

/**
 * Creates default OwnedItems
 * @returns {OwnedItems}
 */
export function createOwnedItems() {
  return {
    colors: ['blue'],
    bodies: ['body_halftrack'],
    weapons: ['turret_01_mk1'],
  };
}

/**
 * Creates default PlayerStats
 * @returns {PlayerStats}
 */
export function createPlayerStats() {
  return {
    kills: 0,
    deaths: 0,
    gamesPlayed: 0,
  };
}

/**
 * Creates a default ProgressionSlice
 * @returns {ProgressionSlice}
 */
export function createProgressionSlice() {
  return {
    currency: 0,
    ownedItems: createOwnedItems(),
    achievements: [],
    stats: createPlayerStats(),
  };
}

/**
 * Creates a default MetaSlice
 * @returns {MetaSlice}
 */
export function createMetaSlice() {
  return {
    version: STATE_VERSION,
    lastSaved: Date.now(),
    sessionId: generateSessionId(),
  };
}

/**
 * Generates a unique session ID
 * @returns {string}
 */
export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a complete default GameState
 * @returns {GameState}
 */
export function createDefaultGameState() {
  return {
    players: createPlayersSlice(),
    bullets: createBulletsSlice(),
    powerups: createPowerupsSlice(),
    map: createMapSlice(),
    weather: createWeatherSlice(),
    ui: createUISlice(),
    settings: createSettingsSlice(),
    progression: createProgressionSlice(),
    meta: createMetaSlice(),
  };
}


/**
 * Creates a StateSnapshot from a GameState
 * @param {GameState} state - The state to snapshot
 * @param {string} [checksum=''] - Optional checksum (will be computed if not provided)
 * @returns {StateSnapshot}
 */
export function createStateSnapshot(state, checksum = '') {
  return {
    state,
    timestamp: Date.now(),
    version: STATE_VERSION,
    checksum,
  };
}

/**
 * Creates a StateAction
 * @param {string} type - Action type
 * @param {*} payload - Action payload
 * @param {'local'|'server'} [source='local'] - Action source
 * @param {boolean} [optimistic=false] - Whether this is an optimistic update
 * @returns {StateAction}
 */
export function createAction(type, payload, source = 'local', optimistic = false) {
  return {
    type,
    payload,
    timestamp: Date.now(),
    source,
    optimistic,
  };
}

/**
 * Creates a ValidationResult
 * @param {boolean} valid - Whether validation passed
 * @param {ValidationError[]} [errors=[]] - Validation errors
 * @returns {ValidationResult}
 */
export function createValidationResult(valid, errors = []) {
  return {
    valid,
    errors,
  };
}

/**
 * Creates a ValidationError
 * @param {string} path - Path to invalid value
 * @param {string} message - Error message
 * @param {*} value - The invalid value
 * @returns {ValidationError}
 */
export function createValidationError(path, message, value) {
  return {
    path,
    message,
    value,
  };
}

// ============================================================================
// TYPE GUARDS / VALIDATORS
// ============================================================================

/**
 * Checks if a value is a valid Player object
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isPlayer(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.health === 'number' &&
    typeof value.maxHealth === 'number'
  );
}

/**
 * Checks if a value is a valid Bullet object
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isBullet(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.ownerId === 'string'
  );
}

/**
 * Checks if a value is a valid PowerUp object
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isPowerUp(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.type === 'string'
  );
}

/**
 * Checks if a value is a valid StateAction
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isStateAction(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.timestamp === 'number' &&
    (value.source === 'local' || value.source === 'server')
  );
}

/**
 * Checks if a value is a valid StateSnapshot
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isStateSnapshot(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    value.state !== null &&
    typeof value.state === 'object' &&
    typeof value.timestamp === 'number' &&
    typeof value.version === 'string' &&
    typeof value.checksum === 'string'
  );
}

/**
 * Checks if a value is a valid GameState
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isGameState(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    value.players !== undefined &&
    value.bullets !== undefined &&
    value.powerups !== undefined &&
    value.map !== undefined &&
    value.weather !== undefined &&
    value.ui !== undefined &&
    value.settings !== undefined &&
    value.progression !== undefined &&
    value.meta !== undefined
  );
}

/**
 * Gets all slice names from GameState
 * @returns {string[]}
 */
export function getSliceNames() {
  return [
    'players',
    'bullets',
    'powerups',
    'map',
    'weather',
    'ui',
    'settings',
    'progression',
    'meta',
  ];
}
