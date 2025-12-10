/**
 * StateMerger - Multiplayer State Synchronization
 * 
 * This module provides state merging capabilities for multiplayer games,
 * handling conflicts between local and server state with deterministic
 * resolution strategies.
 * 
 * **Validates: Requirements 3.1, 3.3, 3.4**
 * 
 * @module state/StateMerger
 */

import { deepClone, deepEqual } from './utils/index.js';

// ============================================================================
// STATE MERGER CLASS
// ============================================================================

/**
 * StateMerger class that handles merging of local and server state.
 * 
 * Provides:
 * - Deterministic state merging
 * - Timestamp-based conflict resolution
 * - Server-authoritative conflict resolution
 * - Monotonic timestamp tracking
 */
export class StateMerger {
  /**
   * Creates a new StateMerger instance.
   */
  constructor() {
    // Last known timestamps for monotonicity checking
    this._lastTimestamps = new Map();
    
    // Merge strategies for different slice types
    this._mergeStrategies = new Map();
    
    // Register default merge strategies
    this._registerDefaultStrategies();
  }

  /**
   * Merges server state with local state.
   * 
   * Uses deterministic algorithms to ensure consistent results across clients.
   * Server state takes precedence in conflicts.
   * 
   * **Validates: Requirements 3.1, 3.4**
   * 
   * @param {import('./types.js').GameState} localState - Current local state
   * @param {import('./types.js').GameState} serverState - Incoming server state
   * @param {number} serverTimestamp - Server timestamp for the update
   * @returns {{success: boolean, mergedState?: import('./types.js').GameState, conflicts?: Array, error?: string}} Merge result
   */
  merge(localState, serverState, serverTimestamp) {
    try {
      // Validate inputs
      if (!localState || !serverState) {
        return {
          success: false,
          error: 'Both local and server state must be provided',
        };
      }

      // Validate timestamp monotonicity
      const timestampValidation = this._validateTimestamp(serverTimestamp);
      if (!timestampValidation.valid) {
        return {
          success: false,
          error: timestampValidation.error,
        };
      }

      // Detect conflicts
      const conflicts = this._detectConflicts(localState, serverState);
      
      // Merge each slice using appropriate strategy
      const mergedState = {};
      const sliceNames = new Set([
        ...Object.keys(localState),
        ...Object.keys(serverState),
      ]);

      for (const sliceName of sliceNames) {
        const localSlice = localState[sliceName];
        const serverSlice = serverState[sliceName];
        
        mergedState[sliceName] = this._mergeSlice(
          sliceName,
          localSlice,
          serverSlice,
          serverTimestamp
        );
      }

      // Update timestamp tracking
      this._updateTimestamp(serverTimestamp);

      return {
        success: true,
        mergedState,
        conflicts,
      };
    } catch (error) {
      return {
        success: false,
        error: `Merge failed: ${error.message}`,
      };
    }
  }

  /**
   * Registers a custom merge strategy for a slice type.
   * 
   * @param {string} sliceName - Name of the slice
   * @param {Function} strategy - Merge strategy function
   */
  registerMergeStrategy(sliceName, strategy) {
    if (typeof strategy !== 'function') {
      throw new Error('Merge strategy must be a function');
    }
    
    this._mergeStrategies.set(sliceName, strategy);
  }

  /**
   * Gets the last known timestamp.
   * 
   * **Validates: Requirements 3.3**
   * 
   * @returns {number} Last timestamp
   */
  getLastTimestamp() {
    return this._lastTimestamps.get('server') || 0;
  }

  /**
   * Resets timestamp tracking.
   */
  resetTimestamps() {
    this._lastTimestamps.clear();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Validates timestamp monotonicity.
   * 
   * **Validates: Requirements 3.3**
   * 
   * @private
   * @param {number} timestamp - Timestamp to validate
   * @returns {{valid: boolean, error?: string}} Validation result
   */
  _validateTimestamp(timestamp) {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
      return {
        valid: false,
        error: 'Timestamp must be a valid number',
      };
    }

    const lastTimestamp = this.getLastTimestamp();
    if (timestamp < lastTimestamp) {
      return {
        valid: false,
        error: `Timestamp ${timestamp} is not monotonic (last: ${lastTimestamp})`,
      };
    }

    return { valid: true };
  }

  /**
   * Updates timestamp tracking.
   * 
   * @private
   * @param {number} timestamp - New timestamp
   */
  _updateTimestamp(timestamp) {
    this._lastTimestamps.set('server', timestamp);
  }

  /**
   * Detects conflicts between local and server state.
   * 
   * **Validates: Requirements 3.4**
   * 
   * @private
   * @param {import('./types.js').GameState} localState - Local state
   * @param {import('./types.js').GameState} serverState - Server state
   * @returns {Array} Array of detected conflicts
   */
  _detectConflicts(localState, serverState) {
    const conflicts = [];
    
    // Check each slice for conflicts
    const sliceNames = new Set([
      ...Object.keys(localState),
      ...Object.keys(serverState),
    ]);

    for (const sliceName of sliceNames) {
      const localSlice = localState[sliceName];
      const serverSlice = serverState[sliceName];
      
      // Skip if slices are identical
      if (deepEqual(localSlice, serverSlice)) {
        continue;
      }
      
      // Detect specific conflicts based on slice type
      const sliceConflicts = this._detectSliceConflicts(sliceName, localSlice, serverSlice);
      conflicts.push(...sliceConflicts);
    }
    
    return conflicts;
  }

  /**
   * Detects conflicts within a specific slice.
   * 
   * @private
   * @param {string} sliceName - Name of the slice
   * @param {any} localSlice - Local slice data
   * @param {any} serverSlice - Server slice data
   * @returns {Array} Array of conflicts in this slice
   */
  _detectSliceConflicts(sliceName, localSlice, serverSlice) {
    const conflicts = [];
    
    if (!localSlice || !serverSlice) {
      return conflicts;
    }

    switch (sliceName) {
      case 'players':
        return this._detectPlayerConflicts(localSlice, serverSlice);
      
      case 'bullets':
        return this._detectBulletConflicts(localSlice, serverSlice);
      
      default:
        // Generic conflict detection
        if (!deepEqual(localSlice, serverSlice)) {
          conflicts.push({
            type: 'slice_mismatch',
            slice: sliceName,
            local: localSlice,
            server: serverSlice,
          });
        }
        return conflicts;
    }
  }

  /**
   * Detects conflicts in player data.
   * 
   * @private
   * @param {Object} localPlayers - Local players slice
   * @param {Object} serverPlayers - Server players slice
   * @returns {Array} Array of player conflicts
   */
  _detectPlayerConflicts(localPlayers, serverPlayers) {
    const conflicts = [];
    
    if (!localPlayers.byId || !serverPlayers.byId) {
      return conflicts;
    }

    // Check each player
    const allPlayerIds = new Set([
      ...Object.keys(localPlayers.byId),
      ...Object.keys(serverPlayers.byId),
    ]);

    for (const playerId of allPlayerIds) {
      const localPlayer = localPlayers.byId[playerId];
      const serverPlayer = serverPlayers.byId[playerId];
      
      if (localPlayer && serverPlayer && !deepEqual(localPlayer, serverPlayer)) {
        conflicts.push({
          type: 'player_mismatch',
          playerId,
          local: localPlayer,
          server: serverPlayer,
        });
      }
    }
    
    return conflicts;
  }

  /**
   * Detects conflicts in bullet data.
   * 
   * @private
   * @param {Object} localBullets - Local bullets slice
   * @param {Object} serverBullets - Server bullets slice
   * @returns {Array} Array of bullet conflicts
   */
  _detectBulletConflicts(localBullets, serverBullets) {
    const conflicts = [];
    
    if (!localBullets.byId || !serverBullets.byId) {
      return conflicts;
    }

    // Check bullet count differences
    const localCount = Object.keys(localBullets.byId).length;
    const serverCount = Object.keys(serverBullets.byId).length;
    
    if (localCount !== serverCount) {
      conflicts.push({
        type: 'bullet_count_mismatch',
        localCount,
        serverCount,
      });
    }
    
    return conflicts;
  }

  /**
   * Merges a specific slice using the appropriate strategy.
   * 
   * **Validates: Requirements 3.1**
   * 
   * @private
   * @param {string} sliceName - Name of the slice
   * @param {any} localSlice - Local slice data
   * @param {any} serverSlice - Server slice data
   * @param {number} timestamp - Server timestamp
   * @returns {any} Merged slice data
   */
  _mergeSlice(sliceName, localSlice, serverSlice, timestamp) {
    // Get merge strategy for this slice
    const strategy = this._mergeStrategies.get(sliceName);
    
    if (strategy) {
      return strategy(localSlice, serverSlice, timestamp);
    }
    
    // Default strategy: server wins
    return serverSlice !== undefined ? deepClone(serverSlice) : deepClone(localSlice);
  }

  /**
   * Registers default merge strategies for built-in slice types.
   * 
   * @private
   */
  _registerDefaultStrategies() {
    // Players: Server authoritative for positions, merge other data
    this.registerMergeStrategy('players', (local, server, timestamp) => {
      if (!server) return deepClone(local);
      if (!local) return deepClone(server);
      
      const merged = deepClone(server); // Start with server data
      
      // Preserve local player's input state if it exists
      if (local.localPlayerId && server.byId && local.byId) {
        const localPlayer = local.byId[local.localPlayerId];
        const serverPlayer = server.byId[local.localPlayerId];
        
        if (localPlayer && serverPlayer) {
          // Keep local input state but use server position
          merged.byId[local.localPlayerId] = {
            ...localPlayer,
            x: serverPlayer.x,
            y: serverPlayer.y,
            health: serverPlayer.health,
            lastUpdate: timestamp,
          };
        }
      }
      
      return merged;
    });

    // Bullets: Server authoritative
    this.registerMergeStrategy('bullets', (local, server, timestamp) => {
      return server ? deepClone(server) : deepClone(local);
    });

    // Powerups: Server authoritative
    this.registerMergeStrategy('powerups', (local, server, timestamp) => {
      return server ? deepClone(server) : deepClone(local);
    });

    // Settings: Local takes precedence
    this.registerMergeStrategy('settings', (local, server, timestamp) => {
      return local ? deepClone(local) : deepClone(server);
    });

    // UI: Local takes precedence
    this.registerMergeStrategy('ui', (local, server, timestamp) => {
      return local ? deepClone(local) : deepClone(server);
    });

    // Map: Server authoritative
    this.registerMergeStrategy('map', (local, server, timestamp) => {
      return server ? deepClone(server) : deepClone(local);
    });

    // Weather: Server authoritative
    this.registerMergeStrategy('weather', (local, server, timestamp) => {
      return server ? deepClone(server) : deepClone(local);
    });

    // Progression: Merge with server taking precedence for conflicts
    this.registerMergeStrategy('progression', (local, server, timestamp) => {
      if (!server) return deepClone(local);
      if (!local) return deepClone(server);
      
      // Server wins for progression data
      return deepClone(server);
    });

    // Meta: Server authoritative
    this.registerMergeStrategy('meta', (local, server, timestamp) => {
      return server ? deepClone(server) : deepClone(local);
    });
  }
}

export default StateMerger;