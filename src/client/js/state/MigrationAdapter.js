/**
 * MigrationAdapter - Legacy Game State Integration
 * 
 * This module provides a compatibility layer for gradually migrating
 * from the existing gameState object to the new StateManager system.
 * 
 * **Validates: Requirements 2.1**
 * 
 * @module state/MigrationAdapter
 */

import { StateManager } from './StateManager.js';
import { 
  createDefaultGameState,
  PLAYER_ACTIONS,
  BULLET_ACTIONS,
  STATE_ACTIONS
} from './types.js';

// ============================================================================
// MIGRATION ADAPTER CLASS
// ============================================================================

/**
 * MigrationAdapter class that provides compatibility between old and new state systems.
 * 
 * Provides:
 * - Mapping from legacy gameState to StateManager
 * - Compatibility methods for existing game code
 * - Gradual migration support
 * - Event bridging between systems
 */
export class MigrationAdapter {
  /**
   * Creates a new MigrationAdapter instance.
   * 
   * @param {Object} [legacyGameState] - Existing game state object
   */
  constructor(legacyGameState = null) {
    // Create new StateManager
    this._stateManager = new StateManager();
    
    // Legacy state reference
    this._legacyState = legacyGameState;
    
    // Migration status
    this._migrationComplete = false;
    
    // Legacy method mappings
    this._setupLegacyMethods();
    
    // If legacy state provided, migrate it
    if (legacyGameState) {
      this._migrateLegacyState(legacyGameState);
    }
  }

  /**
   * Gets the StateManager instance.
   * 
   * @returns {StateManager} The StateManager instance
   */
  getStateManager() {
    return this._stateManager;
  }

  /**
   * Gets the current state (compatible with legacy code).
   * 
   * @returns {import('./types.js').GameState} Current game state
   */
  getState() {
    return this._stateManager.getState();
  }

  /**
   * Migrates legacy gameState to new StateManager.
   * 
   * **Validates: Requirements 2.1**
   * 
   * @param {Object} legacyState - Legacy game state object
   */
  migrateLegacyState(legacyState) {
    this._migrateLegacyState(legacyState);
  }

  /**
   * Adds a player (legacy compatible method).
   * 
   * @param {Object} playerData - Player data
   * @returns {boolean} Success status
   */
  addPlayer(playerData) {
    return this._stateManager.dispatch({
      type: PLAYER_ACTIONS.PLAYER_ADD,
      payload: playerData,
      timestamp: Date.now(),
      source: 'local',
    });
  }

  /**
   * Removes a player (legacy compatible method).
   * 
   * @param {string} playerId - Player ID to remove
   * @returns {boolean} Success status
   */
  removePlayer(playerId) {
    return this._stateManager.dispatch({
      type: PLAYER_ACTIONS.PLAYER_REMOVE,
      payload: { id: playerId },
      timestamp: Date.now(),
      source: 'local',
    });
  }

  /**
   * Updates player position (legacy compatible method).
   * 
   * @param {string} playerId - Player ID
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {boolean} Success status
   */
  updatePlayerPosition(playerId, x, y) {
    return this._stateManager.dispatch({
      type: PLAYER_ACTIONS.PLAYER_MOVE,
      payload: { id: playerId, x, y },
      timestamp: Date.now(),
      source: 'local',
    });
  }

  /**
   * Updates player health (legacy compatible method).
   * 
   * @param {string} playerId - Player ID
   * @param {number} health - New health value
   * @returns {boolean} Success status
   */
  updatePlayerHealth(playerId, health) {
    return this._stateManager.dispatch({
      type: PLAYER_ACTIONS.PLAYER_SET_HEALTH,
      payload: { id: playerId, health },
      timestamp: Date.now(),
      source: 'local',
    });
  }

  /**
   * Adds a bullet (legacy compatible method).
   * 
   * @param {Object} bulletData - Bullet data
   * @returns {boolean} Success status
   */
  addBullet(bulletData) {
    return this._stateManager.dispatch({
      type: BULLET_ACTIONS.BULLET_CREATE,
      payload: bulletData,
      timestamp: Date.now(),
      source: 'local',
    });
  }

  /**
   * Removes a bullet (legacy compatible method).
   * 
   * @param {string} bulletId - Bullet ID to remove
   * @returns {boolean} Success status
   */
  removeBullet(bulletId) {
    return this._stateManager.dispatch({
      type: BULLET_ACTIONS.BULLET_REMOVE,
      payload: { id: bulletId },
      timestamp: Date.now(),
      source: 'local',
    });
  }

  /**
   * Clears all bullets (legacy compatible method).
   * 
   * @returns {boolean} Success status
   */
  clearBullets() {
    return this._stateManager.dispatch({
      type: BULLET_ACTIONS.BULLETS_CLEAR,
      payload: {},
      timestamp: Date.now(),
      source: 'local',
    });
  }

  /**
   * Subscribes to state changes (legacy compatible method).
   * 
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onStateChange(callback) {
    return this._stateManager.subscribe(callback);
  }

  /**
   * Checks if migration is complete.
   * 
   * @returns {boolean} True if migration is complete
   */
  isMigrationComplete() {
    return this._migrationComplete;
  }

  /**
   * Marks migration as complete.
   */
  completeMigration() {
    this._migrationComplete = true;
    this._legacyState = null;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Migrates legacy state to new StateManager.
   * 
   * @private
   * @param {Object} legacyState - Legacy game state
   */
  _migrateLegacyState(legacyState) {
    try {
      // Create new state based on legacy state
      const newState = this._convertLegacyState(legacyState);
      
      // Restore the converted state
      this._stateManager.dispatch({
        type: STATE_ACTIONS.STATE_RESTORE,
        payload: newState,
        timestamp: Date.now(),
        source: 'local',
      });
      
      console.log('[MigrationAdapter] Successfully migrated legacy state');
    } catch (error) {
      console.error('[MigrationAdapter] Failed to migrate legacy state:', error);
      
      // Fall back to default state
      this._stateManager.dispatch({
        type: STATE_ACTIONS.STATE_RESET,
        payload: {},
        timestamp: Date.now(),
        source: 'local',
      });
    }
  }

  /**
   * Converts legacy state format to new state format.
   * 
   * @private
   * @param {Object} legacyState - Legacy state object
   * @returns {import('./types.js').GameState} Converted state
   */
  _convertLegacyState(legacyState) {
    const newState = createDefaultGameState();
    
    // Migrate players
    if (legacyState.players) {
      if (Array.isArray(legacyState.players)) {
        // Legacy format: array of players
        legacyState.players.forEach(player => {
          if (player.id) {
            newState.players.byId[player.id] = this._convertPlayer(player);
            newState.players.allIds.push(player.id);
          }
        });
      } else if (legacyState.players.byId) {
        // Already in new format
        newState.players = { ...legacyState.players };
      }
    }
    
    // Migrate bullets
    if (legacyState.bullets) {
      if (Array.isArray(legacyState.bullets)) {
        // Legacy format: array of bullets
        legacyState.bullets.forEach(bullet => {
          if (bullet.id) {
            newState.bullets.byId[bullet.id] = this._convertBullet(bullet);
            newState.bullets.allIds.push(bullet.id);
          }
        });
      } else if (legacyState.bullets.byId) {
        // Already in new format
        newState.bullets = { ...legacyState.bullets };
      }
    }
    
    // Migrate powerups
    if (legacyState.powerups) {
      if (Array.isArray(legacyState.powerups)) {
        // Legacy format: array of powerups
        legacyState.powerups.forEach(powerup => {
          if (powerup.id) {
            newState.powerups.byId[powerup.id] = this._convertPowerup(powerup);
            newState.powerups.allIds.push(powerup.id);
          }
        });
      } else if (legacyState.powerups.byId) {
        // Already in new format
        newState.powerups = { ...legacyState.powerups };
      }
    }
    
    // Migrate map data
    if (legacyState.map) {
      newState.map = {
        ...newState.map,
        ...legacyState.map,
      };
    }
    
    // Migrate settings
    if (legacyState.settings) {
      newState.settings = {
        ...newState.settings,
        ...legacyState.settings,
      };
    }
    
    // Migrate UI state
    if (legacyState.ui) {
      newState.ui = {
        ...newState.ui,
        ...legacyState.ui,
      };
    }
    
    return newState;
  }

  /**
   * Converts legacy player format to new format.
   * 
   * @private
   * @param {Object} legacyPlayer - Legacy player object
   * @returns {Object} Converted player object
   */
  _convertPlayer(legacyPlayer) {
    return {
      id: legacyPlayer.id,
      x: legacyPlayer.x || 0,
      y: legacyPlayer.y || 0,
      angle: legacyPlayer.angle || 0,
      turretAngle: legacyPlayer.turretAngle || 0,
      health: legacyPlayer.health || 100,
      maxHealth: legacyPlayer.maxHealth || 100,
      shield: legacyPlayer.shield || 0,
      maxShield: legacyPlayer.maxShield || 0,
      team: legacyPlayer.team || 'neutral',
      selectedTank: legacyPlayer.selectedTank || {
        bodyType: 'default',
        color: 'blue',
        weaponType: 'default',
      },
      velocity: legacyPlayer.velocity || { x: 0, y: 0 },
      lastUpdate: legacyPlayer.lastUpdate || Date.now(),
    };
  }

  /**
   * Converts legacy bullet format to new format.
   * 
   * @private
   * @param {Object} legacyBullet - Legacy bullet object
   * @returns {Object} Converted bullet object
   */
  _convertBullet(legacyBullet) {
    return {
      id: legacyBullet.id,
      x: legacyBullet.x || 0,
      y: legacyBullet.y || 0,
      vx: legacyBullet.vx || 0,
      vy: legacyBullet.vy || 0,
      damage: legacyBullet.damage || 10,
      ownerId: legacyBullet.ownerId || null,
      weaponType: legacyBullet.weaponType || 'default',
      createdAt: legacyBullet.createdAt || Date.now(),
    };
  }

  /**
   * Converts legacy powerup format to new format.
   * 
   * @private
   * @param {Object} legacyPowerup - Legacy powerup object
   * @returns {Object} Converted powerup object
   */
  _convertPowerup(legacyPowerup) {
    return {
      id: legacyPowerup.id,
      x: legacyPowerup.x || 0,
      y: legacyPowerup.y || 0,
      type: legacyPowerup.type || 'health',
      value: legacyPowerup.value || 10,
      spawnedAt: legacyPowerup.spawnedAt || Date.now(),
    };
  }

  /**
   * Sets up legacy method compatibility.
   * 
   * @private
   */
  _setupLegacyMethods() {
    // Create aliases for common legacy methods
    this.gameState = this.getState.bind(this);
    this.updateState = this.getState.bind(this);
    this.players = () => this.getState().players;
    this.bullets = () => this.getState().bullets;
    this.powerups = () => this.getState().powerups;
  }
}

export default MigrationAdapter;