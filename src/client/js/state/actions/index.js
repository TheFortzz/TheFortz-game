/**
 * State Actions
 * 
 * This module exports all state action creators and action types.
 * Actions are discrete operations that modify state in a predictable way.
 * 
 * @module state/actions
 */

/**
 * @typedef {Object} StateAction
 * @property {string} type - Action type identifier
 * @property {*} payload - Action payload data
 * @property {number} timestamp - Action timestamp
 * @property {'local'|'server'} source - Action source
 * @property {boolean} [optimistic] - Whether this is an optimistic update
 */

// Action types
export const ActionTypes = {
  // Player actions
  PLAYER_MOVE: 'PLAYER_MOVE',
  PLAYER_DAMAGE: 'PLAYER_DAMAGE',
  PLAYER_HEAL: 'PLAYER_HEAL',
  PLAYER_ADD: 'PLAYER_ADD',
  PLAYER_REMOVE: 'PLAYER_REMOVE',
  PLAYER_UPDATE: 'PLAYER_UPDATE',
  
  // Bullet actions
  BULLET_CREATE: 'BULLET_CREATE',
  BULLET_REMOVE: 'BULLET_REMOVE',
  BULLET_UPDATE: 'BULLET_UPDATE',
  
  // PowerUp actions
  POWERUP_SPAWN: 'POWERUP_SPAWN',
  POWERUP_COLLECT: 'POWERUP_COLLECT',
  POWERUP_REMOVE: 'POWERUP_REMOVE',
  
  // Map actions
  MAP_SET: 'MAP_SET',
  MAP_UPDATE: 'MAP_UPDATE',
  
  // Weather actions
  WEATHER_SET: 'WEATHER_SET',
  
  // UI actions
  UI_UPDATE: 'UI_UPDATE',
  UI_SET_SCREEN: 'UI_SET_SCREEN',
  UI_SET_PAUSED: 'UI_SET_PAUSED',
  
  // Settings actions
  SETTINGS_UPDATE: 'SETTINGS_UPDATE',
  SETTINGS_RESET: 'SETTINGS_RESET',
  
  // Progression actions
  PROGRESSION_UPDATE: 'PROGRESSION_UPDATE',
  PROGRESSION_ADD_CURRENCY: 'PROGRESSION_ADD_CURRENCY',
  PROGRESSION_UNLOCK_ITEM: 'PROGRESSION_UNLOCK_ITEM',
  PROGRESSION_ADD_ACHIEVEMENT: 'PROGRESSION_ADD_ACHIEVEMENT',
  
  // Meta actions
  META_UPDATE: 'META_UPDATE',
  
  // State-level actions
  STATE_RESTORE: 'STATE_RESTORE',
  STATE_RESET: 'STATE_RESET'
};

/**
 * Create a base action with timestamp and source
 * @param {string} type - Action type
 * @param {*} payload - Action payload
 * @param {'local'|'server'} [source='local'] - Action source
 * @param {boolean} [optimistic=false] - Whether this is optimistic
 * @returns {StateAction} The action object
 */
function createAction(type, payload, source = 'local', optimistic = false) {
  return {
    type,
    payload,
    timestamp: Date.now(),
    source,
    optimistic
  };
}

// Player action creators
export const playerActions = {
  /**
   * Move a player to a new position
   * @param {string} id - Player ID
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @returns {StateAction}
   */
  move: (id, x, y) => createAction(ActionTypes.PLAYER_MOVE, { id, x, y }),
  
  /**
   * Apply damage to a player
   * @param {string} id - Player ID
   * @param {number} damage - Damage amount
   * @returns {StateAction}
   */
  damage: (id, damage) => createAction(ActionTypes.PLAYER_DAMAGE, { id, damage }),
  
  /**
   * Heal a player
   * @param {string} id - Player ID
   * @param {number} amount - Heal amount
   * @returns {StateAction}
   */
  heal: (id, amount) => createAction(ActionTypes.PLAYER_HEAL, { id, amount }),
  
  /**
   * Add a new player
   * @param {Object} player - Player data
   * @returns {StateAction}
   */
  add: (player) => createAction(ActionTypes.PLAYER_ADD, player),
  
  /**
   * Remove a player
   * @param {string} id - Player ID
   * @returns {StateAction}
   */
  remove: (id) => createAction(ActionTypes.PLAYER_REMOVE, { id }),
  
  /**
   * Update player properties
   * @param {string} id - Player ID
   * @param {Object} updates - Properties to update
   * @returns {StateAction}
   */
  update: (id, updates) => createAction(ActionTypes.PLAYER_UPDATE, { id, ...updates })
};

// Bullet action creators
export const bulletActions = {
  /**
   * Create a new bullet
   * @param {Object} bullet - Bullet data
   * @returns {StateAction}
   */
  create: (bullet) => createAction(ActionTypes.BULLET_CREATE, bullet),
  
  /**
   * Remove a bullet
   * @param {string} id - Bullet ID
   * @returns {StateAction}
   */
  remove: (id) => createAction(ActionTypes.BULLET_REMOVE, { id }),
  
  /**
   * Update bullet properties
   * @param {string} id - Bullet ID
   * @param {Object} updates - Properties to update
   * @returns {StateAction}
   */
  update: (id, updates) => createAction(ActionTypes.BULLET_UPDATE, { id, ...updates })
};

// PowerUp action creators
export const powerupActions = {
  /**
   * Spawn a new powerup
   * @param {Object} powerup - PowerUp data
   * @returns {StateAction}
   */
  spawn: (powerup) => createAction(ActionTypes.POWERUP_SPAWN, powerup),
  
  /**
   * Collect a powerup
   * @param {string} id - PowerUp ID
   * @param {string} playerId - Collecting player ID
   * @returns {StateAction}
   */
  collect: (id, playerId) => createAction(ActionTypes.POWERUP_COLLECT, { id, playerId }),
  
  /**
   * Remove a powerup
   * @param {string} id - PowerUp ID
   * @returns {StateAction}
   */
  remove: (id) => createAction(ActionTypes.POWERUP_REMOVE, { id })
};

// Settings action creators
export const settingsActions = {
  /**
   * Update settings
   * @param {Object} updates - Settings to update
   * @returns {StateAction}
   */
  update: (updates) => createAction(ActionTypes.SETTINGS_UPDATE, updates),
  
  /**
   * Reset settings to defaults
   * @returns {StateAction}
   */
  reset: () => createAction(ActionTypes.SETTINGS_RESET, {})
};

// UI action creators
export const uiActions = {
  /**
   * Update UI state
   * @param {Object} updates - UI state to update
   * @returns {StateAction}
   */
  update: (updates) => createAction(ActionTypes.UI_UPDATE, updates),
  
  /**
   * Set current screen
   * @param {string} screen - Screen name
   * @returns {StateAction}
   */
  setScreen: (screen) => createAction(ActionTypes.UI_SET_SCREEN, { screen }),
  
  /**
   * Set paused state
   * @param {boolean} isPaused - Paused state
   * @returns {StateAction}
   */
  setPaused: (isPaused) => createAction(ActionTypes.UI_SET_PAUSED, { isPaused })
};

// Progression action creators
export const progressionActions = {
  /**
   * Update progression state
   * @param {Object} updates - Progression updates
   * @returns {StateAction}
   */
  update: (updates) => createAction(ActionTypes.PROGRESSION_UPDATE, updates),
  
  /**
   * Add currency
   * @param {number} amount - Amount to add
   * @returns {StateAction}
   */
  addCurrency: (amount) => createAction(ActionTypes.PROGRESSION_ADD_CURRENCY, { amount }),
  
  /**
   * Unlock an item
   * @param {string} category - Item category (colors, bodies, weapons)
   * @param {string} itemId - Item ID
   * @returns {StateAction}
   */
  unlockItem: (category, itemId) => createAction(ActionTypes.PROGRESSION_UNLOCK_ITEM, { category, itemId }),
  
  /**
   * Add an achievement
   * @param {string} achievementId - Achievement ID
   * @returns {StateAction}
   */
  addAchievement: (achievementId) => createAction(ActionTypes.PROGRESSION_ADD_ACHIEVEMENT, { achievementId })
};

// State-level action creators
export const stateActions = {
  /**
   * Restore state from snapshot
   * @param {Object} snapshot - State snapshot
   * @returns {StateAction}
   */
  restore: (snapshot) => createAction(ActionTypes.STATE_RESTORE, snapshot),
  
  /**
   * Reset state to initial
   * @returns {StateAction}
   */
  reset: () => createAction(ActionTypes.STATE_RESET, {})
};

/**
 * Check if an action is valid
 * @param {StateAction} action - Action to validate
 * @returns {boolean} True if action is valid
 */
export function isValidAction(action) {
  if (!action || typeof action !== 'object') return false;
  if (typeof action.type !== 'string') return false;
  if (typeof action.timestamp !== 'number') return false;
  if (!['local', 'server'].includes(action.source)) return false;
  return Object.values(ActionTypes).includes(action.type);
}
