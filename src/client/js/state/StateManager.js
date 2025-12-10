/**
 * StateManager - Centralized Game State Management
 * 
 * This module provides the core StateManager class that manages all game state
 * in a single, immutable state tree. It follows a unidirectional data flow pattern
 * with validation, event-driven subscriptions, and immutable state updates.
 * 
 * **Validates: Requirements 1.3, 2.1, 2.2, 2.5, 4.3**
 * 
 * @module state/StateManager
 */

import {
  createDefaultGameState,
  PLAYER_ACTIONS,
  BULLET_ACTIONS,
  POWERUP_ACTIONS,
  STATE_ACTIONS,
} from './types.js';
import { StateValidator } from './validators/StateValidator.js';
import { registerActionValidators } from './validators/actionValidators.js';
import { deepClone } from './utils/index.js';

// ============================================================================
// STATE MANAGER CLASS
// ============================================================================

/**
 * StateManager class that manages the game state tree.
 * 
 * Provides:
 * - Immutable state updates via dispatch
 * - State validation before applying changes
 * - Event-driven subscriptions for state changes
 * - Slice-specific subscriptions
 */
export class StateManager {
  /**
   * Creates a new StateManager instance.
   * 
   * @param {import('./types.js').GameState} [initialState] - Optional initial state
   */
  constructor(initialState = null) {
    // Deep clone initial state to ensure immutability
    this._state = initialState ? deepClone(initialState) : createDefaultGameState();
    
    // Create validator instance
    this._validator = new StateValidator();
    
    // Register action validators
    registerActionValidators(StateValidator);
    
    // Subscribers for state changes
    this._subscribers = new Set();
    
    // Slice-specific subscribers
    this._sliceSubscribers = new Map();
    
    // Last timestamp for monotonicity
    this._lastTimestamp = 0;
  }

  /**
   * Gets the current state (returns immutable copy).
   * 
   * @returns {import('./types.js').GameState} Current game state
   */
  getState() {
    return this._state;
  }

  /**
   * Gets a specific slice of the state.
   * 
   * @template {keyof import('./types.js').GameState} K
   * @param {K} sliceName - Name of the slice to get
   * @returns {import('./types.js').GameState[K]} The requested slice
   */
  getSlice(sliceName) {
    return this._state[sliceName];
  }

  /**
   * Dispatches an action to modify state.
   * 
   * The action is validated before being applied. If validation fails,
   * the state remains unchanged and the method returns false.
   * 
   * **Validates: Requirements 1.3, 2.5, 4.3**
   * 
   * @param {import('./types.js').StateAction} action - The action to dispatch
   * @returns {boolean} True if action was applied, false if rejected
   */
  dispatch(action) {
    // Step 1: Validate the action structure
    const actionValidation = this._validator.validateAction(action, this._state);
    if (!actionValidation.valid) {
      this._logValidationErrors('Action validation failed', actionValidation.errors);
      return false;
    }

    // Step 2: Compute the new state based on the action
    const newState = this._applyAction(action);
    
    // If no state change occurred (action didn't apply), return true
    // This handles cases like moving a non-existent player
    if (newState === this._state) {
      return true;
    }

    // Step 3: Validate the new state
    const stateValidation = this._validator.validate(newState);
    if (!stateValidation.valid) {
      // Reject invalid state change, maintain last valid state
      this._logValidationErrors('State validation failed - rejecting change', stateValidation.errors);
      return false;
    }

    // Step 4: Apply the new state
    const prevState = this._state;
    this._state = newState;

    // Step 5: Notify subscribers
    this._notifySubscribers(prevState);

    return true;
  }

  /**
   * Subscribes to all state changes.
   * 
   * @param {import('./types.js').StateSubscriber} callback - Callback function
   * @returns {() => void} Unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Subscriber callback must be a function');
    }
    
    this._subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this._subscribers.delete(callback);
    };
  }

  /**
   * Subscribes to changes in a specific slice.
   * 
   * @template {keyof import('./types.js').GameState} K
   * @param {K} sliceName - Name of the slice to subscribe to
   * @param {import('./types.js').SliceSubscriber} callback - Callback function
   * @returns {() => void} Unsubscribe function
   */
  subscribeToSlice(sliceName, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Subscriber callback must be a function');
    }
    
    if (!this._sliceSubscribers.has(sliceName)) {
      this._sliceSubscribers.set(sliceName, new Set());
    }
    
    this._sliceSubscribers.get(sliceName).add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this._sliceSubscribers.get(sliceName);
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }

  /**
   * Gets the validator instance.
   * 
   * @returns {StateValidator} The validator instance
   */
  getValidator() {
    return this._validator;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Applies an action to the current state and returns a new state.
   * Uses immutable update patterns.
   * 
   * @private
   * @param {import('./types.js').StateAction} action - The action to apply
   * @returns {import('./types.js').GameState} New state (or same state if no change)
   */
  _applyAction(action) {
    const { type, payload } = action;

    switch (type) {
      // Player actions
      case PLAYER_ACTIONS.PLAYER_ADD:
        return this._addPlayer(payload);
      
      case PLAYER_ACTIONS.PLAYER_REMOVE:
        return this._removePlayer(payload);
      
      case PLAYER_ACTIONS.PLAYER_MOVE:
        return this._movePlayer(payload);
      
      case PLAYER_ACTIONS.PLAYER_DAMAGE:
        return this._damagePlayer(payload);
      
      case PLAYER_ACTIONS.PLAYER_HEAL:
        return this._healPlayer(payload);
      
      case PLAYER_ACTIONS.PLAYER_SET_HEALTH:
        return this._setPlayerHealth(payload);
      
      case PLAYER_ACTIONS.PLAYER_UPDATE:
        return this._updatePlayer(payload);

      // Bullet actions
      case BULLET_ACTIONS.BULLET_CREATE:
        return this._createBullet(payload);
      
      case BULLET_ACTIONS.BULLET_REMOVE:
        return this._removeBullet(payload);
      
      case BULLET_ACTIONS.BULLET_UPDATE:
        return this._updateBullet(payload);
      
      case BULLET_ACTIONS.BULLETS_CLEAR:
        return this._clearBullets();

      // Powerup actions
      case POWERUP_ACTIONS.POWERUP_SPAWN:
        return this._spawnPowerup(payload);
      
      case POWERUP_ACTIONS.POWERUP_COLLECT:
        return this._collectPowerup(payload);
      
      case POWERUP_ACTIONS.POWERUP_REMOVE:
        return this._removePowerup(payload);
      
      case POWERUP_ACTIONS.POWERUPS_CLEAR:
        return this._clearPowerups();

      // State management actions
      case STATE_ACTIONS.STATE_RESET:
        return createDefaultGameState();
      
      case STATE_ACTIONS.STATE_RESTORE:
        return deepClone(payload);
      
      case STATE_ACTIONS.STATE_MERGE:
        return this._mergeState(payload);

      default:
        // Unknown action type - return current state unchanged
        return this._state;
    }
  }

  /**
   * Notifies all subscribers of state change.
   * 
   * @private
   * @param {import('./types.js').GameState} prevState - Previous state
   */
  _notifySubscribers(prevState) {
    // Notify global subscribers
    for (const callback of this._subscribers) {
      try {
        callback(this._state, prevState);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    }

    // Notify slice-specific subscribers
    for (const [sliceName, subscribers] of this._sliceSubscribers) {
      const prevSlice = prevState[sliceName];
      const newSlice = this._state[sliceName];
      
      // Only notify if slice actually changed
      if (prevSlice !== newSlice) {
        for (const callback of subscribers) {
          try {
            callback(newSlice, prevSlice);
          } catch (error) {
            console.error(`Error in slice subscriber for ${sliceName}:`, error);
          }
        }
      }
    }
  }

  /**
   * Logs validation errors.
   * 
   * @private
   * @param {string} message - Error message prefix
   * @param {import('./types.js').ValidationError[]} errors - Validation errors
   */
  _logValidationErrors(message, errors) {
    console.warn(`[StateManager] ${message}:`);
    for (const error of errors) {
      console.warn(`  - ${error.path}: ${error.message} (value: ${JSON.stringify(error.value)})`);
    }
  }

  // ============================================================================
  // PLAYER ACTION HANDLERS
  // ============================================================================

  /**
   * @private
   */
  _addPlayer(payload) {
    const { id } = payload;
    if (this._state.players.byId[id]) {
      return this._state; // Player already exists
    }
    
    return {
      ...this._state,
      players: {
        ...this._state.players,
        byId: {
          ...this._state.players.byId,
          [id]: { ...payload },
        },
        allIds: [...this._state.players.allIds, id],
      },
    };
  }

  /**
   * @private
   */
  _removePlayer(payload) {
    const { id } = payload;
    if (!this._state.players.byId[id]) {
      return this._state; // Player doesn't exist
    }
    
    const { [id]: removed, ...remainingPlayers } = this._state.players.byId;
    
    return {
      ...this._state,
      players: {
        ...this._state.players,
        byId: remainingPlayers,
        allIds: this._state.players.allIds.filter(pid => pid !== id),
      },
    };
  }

  /**
   * @private
   */
  _movePlayer(payload) {
    const { id, x, y } = payload;
    const player = this._state.players.byId[id];
    if (!player) {
      return this._state; // Player doesn't exist
    }
    
    return {
      ...this._state,
      players: {
        ...this._state.players,
        byId: {
          ...this._state.players.byId,
          [id]: {
            ...player,
            x,
            y,
            lastUpdate: Date.now(),
          },
        },
      },
    };
  }

  /**
   * @private
   */
  _damagePlayer(payload) {
    const { id, damage } = payload;
    const player = this._state.players.byId[id];
    if (!player) {
      return this._state; // Player doesn't exist
    }
    
    const newHealth = Math.max(0, player.health - damage);
    
    return {
      ...this._state,
      players: {
        ...this._state.players,
        byId: {
          ...this._state.players.byId,
          [id]: {
            ...player,
            health: newHealth,
            lastUpdate: Date.now(),
          },
        },
      },
    };
  }

  /**
   * @private
   */
  _healPlayer(payload) {
    const { id, amount } = payload;
    const player = this._state.players.byId[id];
    if (!player) {
      return this._state; // Player doesn't exist
    }
    
    const newHealth = Math.min(player.maxHealth, player.health + amount);
    
    return {
      ...this._state,
      players: {
        ...this._state.players,
        byId: {
          ...this._state.players.byId,
          [id]: {
            ...player,
            health: newHealth,
            lastUpdate: Date.now(),
          },
        },
      },
    };
  }

  /**
   * @private
   */
  _setPlayerHealth(payload) {
    const { id, health } = payload;
    const player = this._state.players.byId[id];
    if (!player) {
      return this._state; // Player doesn't exist
    }
    
    return {
      ...this._state,
      players: {
        ...this._state.players,
        byId: {
          ...this._state.players.byId,
          [id]: {
            ...player,
            health,
            lastUpdate: Date.now(),
          },
        },
      },
    };
  }

  /**
   * @private
   */
  _updatePlayer(payload) {
    const { id, ...updates } = payload;
    const player = this._state.players.byId[id];
    if (!player) {
      return this._state; // Player doesn't exist
    }
    
    return {
      ...this._state,
      players: {
        ...this._state.players,
        byId: {
          ...this._state.players.byId,
          [id]: {
            ...player,
            ...updates,
            lastUpdate: Date.now(),
          },
        },
      },
    };
  }

  // ============================================================================
  // BULLET ACTION HANDLERS
  // ============================================================================

  /**
   * @private
   */
  _createBullet(payload) {
    const { id } = payload;
    if (this._state.bullets.byId[id]) {
      return this._state; // Bullet already exists
    }
    
    return {
      ...this._state,
      bullets: {
        ...this._state.bullets,
        byId: {
          ...this._state.bullets.byId,
          [id]: { ...payload, createdAt: payload.createdAt || Date.now() },
        },
        allIds: [...this._state.bullets.allIds, id],
      },
    };
  }

  /**
   * @private
   */
  _removeBullet(payload) {
    const { id } = payload;
    if (!this._state.bullets.byId[id]) {
      return this._state; // Bullet doesn't exist
    }
    
    const { [id]: removed, ...remainingBullets } = this._state.bullets.byId;
    
    return {
      ...this._state,
      bullets: {
        ...this._state.bullets,
        byId: remainingBullets,
        allIds: this._state.bullets.allIds.filter(bid => bid !== id),
      },
    };
  }

  /**
   * @private
   */
  _updateBullet(payload) {
    const { id, ...updates } = payload;
    const bullet = this._state.bullets.byId[id];
    if (!bullet) {
      return this._state; // Bullet doesn't exist
    }
    
    return {
      ...this._state,
      bullets: {
        ...this._state.bullets,
        byId: {
          ...this._state.bullets.byId,
          [id]: {
            ...bullet,
            ...updates,
          },
        },
      },
    };
  }

  /**
   * @private
   */
  _clearBullets() {
    return {
      ...this._state,
      bullets: {
        byId: {},
        allIds: [],
      },
    };
  }

  // ============================================================================
  // POWERUP ACTION HANDLERS
  // ============================================================================

  /**
   * @private
   */
  _spawnPowerup(payload) {
    const { id } = payload;
    if (this._state.powerups.byId[id]) {
      return this._state; // Powerup already exists
    }
    
    return {
      ...this._state,
      powerups: {
        ...this._state.powerups,
        byId: {
          ...this._state.powerups.byId,
          [id]: { ...payload, spawnedAt: payload.spawnedAt || Date.now() },
        },
        allIds: [...this._state.powerups.allIds, id],
      },
    };
  }

  /**
   * @private
   */
  _collectPowerup(payload) {
    const { id } = payload;
    return this._removePowerup({ id });
  }

  /**
   * @private
   */
  _removePowerup(payload) {
    const { id } = payload;
    if (!this._state.powerups.byId[id]) {
      return this._state; // Powerup doesn't exist
    }
    
    const { [id]: removed, ...remainingPowerups } = this._state.powerups.byId;
    
    return {
      ...this._state,
      powerups: {
        ...this._state.powerups,
        byId: remainingPowerups,
        allIds: this._state.powerups.allIds.filter(pid => pid !== id),
      },
    };
  }

  /**
   * @private
   */
  _clearPowerups() {
    return {
      ...this._state,
      powerups: {
        byId: {},
        allIds: [],
      },
    };
  }

  // ============================================================================
  // STATE MANAGEMENT HANDLERS
  // ============================================================================

  /**
   * @private
   */
  _mergeState(payload) {
    // Deep merge the payload into current state
    return {
      ...this._state,
      ...payload,
      players: payload.players ? {
        ...this._state.players,
        ...payload.players,
        byId: {
          ...this._state.players.byId,
          ...(payload.players.byId || {}),
        },
      } : this._state.players,
      bullets: payload.bullets ? {
        ...this._state.bullets,
        ...payload.bullets,
        byId: {
          ...this._state.bullets.byId,
          ...(payload.bullets.byId || {}),
        },
      } : this._state.bullets,
      powerups: payload.powerups ? {
        ...this._state.powerups,
        ...payload.powerups,
        byId: {
          ...this._state.powerups.byId,
          ...(payload.powerups.byId || {}),
        },
      } : this._state.powerups,
    };
  }
}

export default StateManager;
