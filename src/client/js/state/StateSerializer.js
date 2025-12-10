/**
 * StateSerializer - State Serialization and Deserialization
 * 
 * This module provides serialization, deserialization, pretty-printing,
 * and parsing capabilities for game state snapshots.
 * 
 * **Validates: Requirements 2.3, 2.4, 4.4, 4.5**
 * 
 * @module state/StateSerializer
 */

import { 
  STATE_VERSION, 
  isStateSnapshot,
  isGameState
} from './types.js';
import { deepClone, calculateChecksum } from './utils/index.js';

// ============================================================================
// STATE SERIALIZER CLASS
// ============================================================================

/**
 * StateSerializer class that handles serialization and deserialization
 * of game state snapshots.
 * 
 * Provides:
 * - Serialize state to StateSnapshot with checksum
 * - Restore state from StateSnapshot with validation
 * - Pretty-print state for debugging
 * - Parse pretty-printed state back to snapshot
 */
export class StateSerializer {
  /**
   * Creates a new StateSerializer instance.
   */
  constructor() {
    // Version migrations registry
    this._migrations = new Map();
  }

  /**
   * Serializes a GameState to a StateSnapshot.
   * 
   * Creates a complete snapshot with:
   * - Deep cloned state
   * - Current timestamp
   * - State version
   * - Integrity checksum
   * 
   * **Validates: Requirements 2.3**
   * 
   * @param {import('./types.js').GameState} state - The state to serialize
   * @returns {import('./types.js').StateSnapshot} The serialized snapshot
   */
  serialize(state) {
    if (!state || typeof state !== 'object') {
      throw new Error('Cannot serialize: invalid state provided');
    }

    // Deep clone to ensure immutability
    const clonedState = deepClone(state);
    
    // Generate checksum for integrity verification
    const checksum = calculateChecksum(clonedState);
    
    // Create and return snapshot
    return {
      state: clonedState,
      timestamp: Date.now(),
      version: STATE_VERSION,
      checksum,
    };
  }


  /**
   * Restores a GameState from a StateSnapshot.
   * 
   * Validates the snapshot before restoring:
   * - Validates checksum integrity
   * - Handles version migrations if needed
   * 
   * **Validates: Requirements 2.4**
   * 
   * @param {import('./types.js').StateSnapshot} snapshot - The snapshot to restore
   * @returns {{ success: boolean, state: import('./types.js').GameState | null, error?: string }} Restore result
   */
  restore(snapshot) {
    // Validate snapshot structure
    if (!isStateSnapshot(snapshot)) {
      return {
        success: false,
        state: null,
        error: 'Invalid snapshot structure',
      };
    }

    // Validate checksum integrity
    const computedChecksum = calculateChecksum(snapshot.state);
    if (computedChecksum !== snapshot.checksum) {
      return {
        success: false,
        state: null,
        error: `Checksum mismatch: expected ${snapshot.checksum}, got ${computedChecksum}`,
      };
    }

    // Handle version migrations if needed
    let state = snapshot.state;
    if (snapshot.version !== STATE_VERSION) {
      const migrationResult = this._migrateState(state, snapshot.version);
      if (!migrationResult.success) {
        return {
          success: false,
          state: null,
          error: migrationResult.error,
        };
      }
      state = migrationResult.state;
    }

    // Validate the restored state structure
    if (!isGameState(state)) {
      return {
        success: false,
        state: null,
        error: 'Restored state does not match GameState structure',
      };
    }

    // Return deep cloned state to ensure immutability
    return {
      success: true,
      state: deepClone(state),
    };
  }

  /**
   * Pretty-prints a StateSnapshot for debugging.
   * 
   * Formats the snapshot as human-readable JSON with:
   * - Indentation for readability
   * - Type annotations as comments
   * - Metadata header
   * 
   * **Validates: Requirements 4.4**
   * 
   * @param {import('./types.js').StateSnapshot} snapshot - The snapshot to format
   * @returns {string} Pretty-printed string representation
   */
  prettyPrint(snapshot) {
    if (!isStateSnapshot(snapshot)) {
      throw new Error('Cannot pretty-print: invalid snapshot provided');
    }

    // Create a formatted output with metadata header
    const header = {
      _type: 'StateSnapshot',
      _version: snapshot.version,
      _timestamp: snapshot.timestamp,
      _timestampISO: new Date(snapshot.timestamp).toISOString(),
      _checksum: snapshot.checksum,
    };

    // Annotate state slices with type information
    const annotatedState = this._annotateState(snapshot.state);

    const output = {
      ...header,
      state: annotatedState,
    };

    return JSON.stringify(output, null, 2);
  }

  /**
   * Parses a pretty-printed string back to a StateSnapshot.
   * 
   * Handles parsing errors gracefully and validates the result.
   * 
   * **Validates: Requirements 4.5**
   * 
   * @param {string} serialized - The pretty-printed string to parse
   * @returns {{ success: boolean, snapshot: import('./types.js').StateSnapshot | null, error?: string }} Parse result
   */
  parse(serialized) {
    if (typeof serialized !== 'string') {
      return {
        success: false,
        snapshot: null,
        error: 'Input must be a string',
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(serialized);
    } catch (e) {
      return {
        success: false,
        snapshot: null,
        error: `JSON parse error: ${e.message}`,
      };
    }

    // Validate parsed is an object
    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        snapshot: null,
        error: 'Parsed data is not a valid object',
      };
    }

    // Extract metadata and state
    const { _type, _version, _timestamp, _checksum, state } = parsed;

    // Validate it's a StateSnapshot
    if (_type !== 'StateSnapshot') {
      return {
        success: false,
        snapshot: null,
        error: `Invalid type: expected StateSnapshot, got ${_type}`,
      };
    }

    // Remove type annotations from state
    const cleanState = this._removeAnnotations(state);

    // Reconstruct the snapshot
    const snapshot = {
      state: cleanState,
      timestamp: _timestamp,
      version: _version,
      checksum: _checksum,
    };

    // Validate the reconstructed snapshot
    if (!isStateSnapshot(snapshot)) {
      return {
        success: false,
        snapshot: null,
        error: 'Reconstructed snapshot is invalid',
      };
    }

    return {
      success: true,
      snapshot,
    };
  }

  /**
   * Registers a migration function for a specific version.
   * 
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @param {(state: any) => any} migrationFn - Migration function
   */
  registerMigration(fromVersion, toVersion, migrationFn) {
    const key = `${fromVersion}->${toVersion}`;
    this._migrations.set(key, migrationFn);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Migrates state from one version to another.
   * 
   * @private
   * @param {any} state - State to migrate
   * @param {string} fromVersion - Source version
   * @returns {{ success: boolean, state?: any, error?: string }} Migration result
   */
  _migrateState(state, fromVersion) {
    const migrationKey = `${fromVersion}->${STATE_VERSION}`;
    const migrationFn = this._migrations.get(migrationKey);

    if (migrationFn) {
      try {
        const migratedState = migrationFn(state);
        return { success: true, state: migratedState };
      } catch (e) {
        return { 
          success: false, 
          error: `Migration failed: ${e.message}` 
        };
      }
    }

    // If no migration exists, try to use the state as-is
    // This allows forward compatibility for minor version changes
    console.warn(`No migration found for ${fromVersion} -> ${STATE_VERSION}, using state as-is`);
    return { success: true, state };
  }

  /**
   * Annotates state with type information for debugging.
   * 
   * @private
   * @param {import('./types.js').GameState} state - State to annotate
   * @returns {Object} Annotated state
   */
  _annotateState(state) {
    return {
      players: {
        _type: 'PlayersSlice',
        ...state.players,
      },
      bullets: {
        _type: 'BulletsSlice',
        ...state.bullets,
      },
      powerups: {
        _type: 'PowerupsSlice',
        ...state.powerups,
      },
      map: {
        _type: 'MapSlice',
        ...state.map,
      },
      weather: {
        _type: 'WeatherSlice',
        ...state.weather,
      },
      ui: {
        _type: 'UISlice',
        ...state.ui,
      },
      settings: {
        _type: 'SettingsSlice',
        ...state.settings,
      },
      progression: {
        _type: 'ProgressionSlice',
        ...state.progression,
      },
      meta: {
        _type: 'MetaSlice',
        ...state.meta,
      },
    };
  }

  /**
   * Removes type annotations from parsed state.
   * 
   * @private
   * @param {Object} annotatedState - State with annotations
   * @returns {Object} Clean state without annotations
   */
  _removeAnnotations(annotatedState) {
    const cleanState = {};
    
    for (const [key, value] of Object.entries(annotatedState)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Remove _type annotation from slice
        const { _type, ...cleanSlice } = value;
        cleanState[key] = cleanSlice;
      } else {
        cleanState[key] = value;
      }
    }
    
    return cleanState;
  }
}

export default StateSerializer;
