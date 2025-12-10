/**
 * State Slices
 * 
 * This module exports all state slice definitions and initial states.
 * A slice is a logical grouping of related state.
 * 
 * @module state/slices
 */

/**
 * @typedef {Object} Player
 * @property {string} id - Unique player identifier
 * @property {number} x - X position coordinate
 * @property {number} y - Y position coordinate
 * @property {number} angle - Body angle in radians
 * @property {number} turretAngle - Turret angle in radians
 * @property {number} health - Current health
 * @property {number} maxHealth - Maximum health
 * @property {number} shield - Current shield
 * @property {number} maxShield - Maximum shield
 * @property {string} team - Team identifier
 * @property {Object} selectedTank - Tank configuration
 * @property {{x: number, y: number}} velocity - Movement velocity
 * @property {number} lastUpdate - Last update timestamp
 */

/**
 * @typedef {Object} PlayersSlice
 * @property {Object.<string, Player>} byId - Players indexed by ID
 * @property {string|null} localPlayerId - Local player's ID
 * @property {string[]} allIds - Array of all player IDs
 */

/**
 * @typedef {Object} Bullet
 * @property {string} id - Unique bullet identifier
 * @property {number} x - X position coordinate
 * @property {number} y - Y position coordinate
 * @property {number} vx - X velocity
 * @property {number} vy - Y velocity
 * @property {string} ownerId - ID of player who fired
 * @property {number} damage - Damage amount
 * @property {number} createdAt - Creation timestamp
 * @property {number} ttl - Time to live in ms
 */

/**
 * @typedef {Object} BulletsSlice
 * @property {Object.<string, Bullet>} byId - Bullets indexed by ID
 * @property {string[]} allIds - Array of all bullet IDs
 */

/**
 * @typedef {Object} PowerUp
 * @property {string} id - Unique powerup identifier
 * @property {number} x - X position coordinate
 * @property {number} y - Y position coordinate
 * @property {string} type - PowerUp type
 * @property {number} value - PowerUp value/strength
 * @property {number} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} PowerupsSlice
 * @property {Object.<string, PowerUp>} byId - PowerUps indexed by ID
 * @property {string[]} allIds - Array of all powerup IDs
 */

/**
 * @typedef {Object} MapSlice
 * @property {number} width - Map width
 * @property {number} height - Map height
 * @property {string} name - Map name
 * @property {Array} obstacles - Map obstacles
 */

/**
 * @typedef {Object} WeatherSlice
 * @property {string} type - Weather type (clear, rain, fog, etc.)
 * @property {number} intensity - Weather intensity 0-1
 */

/**
 * @typedef {Object} UISlice
 * @property {string} currentScreen - Current screen name
 * @property {boolean} isPaused - Game paused state
 * @property {Object} notifications - Active notifications
 */

/**
 * @typedef {Object} SoundSettings
 * @property {number} master - Master volume 0-1
 * @property {number} effects - Effects volume 0-1
 * @property {number} music - Music volume 0-1
 */

/**
 * @typedef {Object} GraphicsSettings
 * @property {'low'|'medium'|'high'|'ultra'} quality - Graphics quality
 * @property {boolean} particles - Enable particles
 * @property {boolean} shadows - Enable shadows
 */

/**
 * @typedef {Object} SettingsSlice
 * @property {SoundSettings} sound - Sound settings
 * @property {GraphicsSettings} graphics - Graphics settings
 * @property {Object.<string, string>} controls - Key bindings
 */

/**
 * @typedef {Object} OwnedItems
 * @property {string[]} colors - Owned color schemes
 * @property {string[]} bodies - Owned tank bodies
 * @property {string[]} weapons - Owned weapons
 */

/**
 * @typedef {Object} PlayerStats
 * @property {number} kills - Total kills
 * @property {number} deaths - Total deaths
 * @property {number} gamesPlayed - Total games played
 */

/**
 * @typedef {Object} ProgressionSlice
 * @property {number} currency - Player currency
 * @property {OwnedItems} ownedItems - Owned items
 * @property {string[]} achievements - Unlocked achievements
 * @property {PlayerStats} stats - Player statistics
 */

/**
 * @typedef {Object} MetaSlice
 * @property {string} version - State version
 * @property {number} lastSaved - Last save timestamp
 * @property {string} sessionId - Current session ID
 */

/**
 * @typedef {Object} GameState
 * @property {PlayersSlice} players - Players state
 * @property {BulletsSlice} bullets - Bullets state
 * @property {PowerupsSlice} powerups - PowerUps state
 * @property {MapSlice} map - Map state
 * @property {WeatherSlice} weather - Weather state
 * @property {UISlice} ui - UI state
 * @property {SettingsSlice} settings - Settings state (persistent)
 * @property {ProgressionSlice} progression - Progression state (persistent)
 * @property {MetaSlice} meta - Metadata state
 */

/**
 * @typedef {Object} StateSnapshot
 * @property {GameState} state - The game state
 * @property {number} timestamp - Snapshot timestamp
 * @property {string} version - State version
 * @property {string} checksum - Integrity checksum
 */

// Initial state for players slice
export const initialPlayersSlice = {
  byId: {},
  localPlayerId: null,
  allIds: []
};

// Initial state for bullets slice
export const initialBulletsSlice = {
  byId: {},
  allIds: []
};

// Initial state for powerups slice
export const initialPowerupsSlice = {
  byId: {},
  allIds: []
};

// Initial state for map slice
export const initialMapSlice = {
  width: 2000,
  height: 2000,
  name: 'default',
  obstacles: []
};

// Initial state for weather slice
export const initialWeatherSlice = {
  type: 'clear',
  intensity: 0
};

// Initial state for UI slice
export const initialUISlice = {
  currentScreen: 'menu',
  isPaused: false,
  notifications: {}
};

// Initial state for settings slice (persistent)
export const initialSettingsSlice = {
  sound: {
    master: 1,
    effects: 0.8,
    music: 0.6
  },
  graphics: {
    quality: 'high',
    particles: true,
    shadows: true
  },
  controls: {
    moveUp: 'KeyW',
    moveDown: 'KeyS',
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    fire: 'Mouse0',
    special: 'Space'
  }
};

// Initial state for progression slice (persistent)
export const initialProgressionSlice = {
  currency: 0,
  ownedItems: {
    colors: ['default'],
    bodies: ['default'],
    weapons: ['default']
  },
  achievements: [],
  stats: {
    kills: 0,
    deaths: 0,
    gamesPlayed: 0
  }
};

// Initial state for meta slice
export const initialMetaSlice = {
  version: '1.0.0',
  lastSaved: 0,
  sessionId: ''
};

/**
 * Create initial game state
 * @returns {GameState} Initial game state
 */
export function createInitialState() {
  return {
    players: { ...initialPlayersSlice },
    bullets: { ...initialBulletsSlice },
    powerups: { ...initialPowerupsSlice },
    map: { ...initialMapSlice },
    weather: { ...initialWeatherSlice },
    ui: { ...initialUISlice },
    settings: { ...initialSettingsSlice },
    progression: { ...initialProgressionSlice },
    meta: { ...initialMetaSlice }
  };
}

/**
 * List of slice names that should be persisted to storage
 */
export const persistentSlices = ['settings', 'progression'];

/**
 * List of all slice names
 */
export const allSliceNames = [
  'players',
  'bullets', 
  'powerups',
  'map',
  'weather',
  'ui',
  'settings',
  'progression',
  'meta'
];
