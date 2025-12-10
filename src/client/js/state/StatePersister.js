/**
 * StatePersister - State Persistence Management
 * 
 * This module provides persistence capabilities for game state,
 * allowing selective saving and loading of state slices to/from localStorage.
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 * 
 * @module state/StatePersister
 */

import { 
  createDefaultGameState,
  isGameState,
  PERSISTENT_SLICES 
} from './types.js';
import { StateSerializer } from './StateSerializer.js';
import { deepClone } from './utils/index.js';

// ============================================================================
// STATE PERSISTER CLASS
// ============================================================================

/**
 * StatePersister class that handles persistence of game state
 * to and from localStorage.
 * 
 * Provides:
 * - Selective persistence of marked slices only
 * - Graceful handling of storage quota errors
 * - Corrupted data detection and fallback
 * - Merge with default state on load
 */
export class StatePersister {
  /**
   * Creates a new StatePersister instance.
   * 
   * @param {string} [storageKey='gameState'] - localStorage key to use
   */
  constructor(storageKey = 'gameState') {
    this._storageKey = storageKey;
    this._serializer = new StateSerializer();
    
    // Check if localStorage is available
    this._isStorageAvailable = this._checkStorageAvailability();
  }

  /**
   * Persists the current state to localStorage.
   * 
   * Only persists slices marked as persistent (settings, progression).
   * Handles storage quota errors gracefully.
   * 
   * **Validates: Requirements 5.1, 5.4**
   * 
   * @param {import('./types.js').GameState} state - The state to persist
   * @returns {{ success: boolean, error?: string }} Persist result
   */
  persist(state) {
    if (!this._isStorageAvailable) {
      return {
        success: false,
        error: 'localStorage is not available',
      };
    }

    if (!isGameState(state)) {
      return {
        success: false,
        error: 'Invalid state provided for persistence',
      };
    }

    try {
      // Filter state to only persistent slices
      const persistentState = this._filterToPersistentSlices(state);
      
      // Serialize the filtered state
      const snapshot = this._serializer.serialize(persistentState);
      
      // Convert to JSON string
      const serialized = JSON.stringify(snapshot);
      
      // Save to localStorage
      localStorage.setItem(this._storageKey, serialized);
      
      return { success: true };
      
    } catch (error) {
      // Handle storage quota exceeded or other errors
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        return {
          success: false,
          error: 'Storage quota exceeded - unable to save state',
        };
      }
      
      return {
        success: false,
        error: `Failed to persist state: ${error.message}`,
      };
    }
  }

  /**
   * Loads state from localStorage and merges with defaults.
   * 
   * Handles corrupted data by falling back to defaults.
   * 
   * **Validates: Requirements 5.2**
   * 
   * @returns {{ success: boolean, state: import('./types.js').GameState, error?: string }} Load result
   */
  load() {
    if (!this._isStorageAvailable) {
      return {
        success: true,
        state: createDefaultGameState(),
        error: 'localStorage not available - using defaults',
      };
    }

    try {
      // Try to load from localStorage
      const serialized = localStorage.getItem(this._storageKey);
      
      if (!serialized) {
        // No saved state - return defaults
        return {
          success: true,
          state: createDefaultGameState(),
        };
      }

      // Parse the serialized data
      let snapshot;
      try {
        snapshot = JSON.parse(serialized);
      } catch (parseError) {
        // Corrupted JSON - clear and return defaults
        this._clearCorruptedData();
        return {
          success: true,
          state: createDefaultGameState(),
          error: 'Corrupted JSON data - cleared and using defaults',
        };
      }

      // Restore state from snapshot
      const restoreResult = this._serializer.restore(snapshot);
      
      if (!restoreResult.success) {
        // Corrupted snapshot - clear and return defaults
        this._clearCorruptedData();
        return {
          success: true,
          state: createDefaultGameState(),
          error: `Corrupted snapshot data - cleared and using defaults: ${restoreResult.error}`,
        };
      }

      // Merge restored persistent state with default state
      const mergedState = this._mergeWithDefaults(restoreResult.state);
      
      return {
        success: true,
        state: mergedState,
      };
      
    } catch (error) {
      // Unexpected error - clear corrupted data and return defaults
      this._clearCorruptedData();
      return {
        success: true,
        state: createDefaultGameState(),
        error: `Unexpected error loading state - using defaults: ${error.message}`,
      };
    }
  }

  /**
   * Clears all persisted state from localStorage.
   * 
   * @returns {{ success: boolean, error?: string }} Clear result
   */
  clear() {
    if (!this._isStorageAvailable) {
      return {
        success: false,
        error: 'localStorage is not available',
      };
    }

    try {
      localStorage.removeItem(this._storageKey);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear persisted state: ${error.message}`,
      };
    }
  }

  /**
   * Checks if there is persisted state available.
   * 
   * @returns {boolean} True if persisted state exists
   */
  hasPersistedState() {
    if (!this._isStorageAvailable) {
      return false;
    }

    try {
      const serialized = localStorage.getItem(this._storageKey);
      return serialized !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the storage key being used.
   * 
   * @returns {string} The storage key
   */
  getStorageKey() {
    return this._storageKey;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Checks if localStorage is available and functional.
   * 
   * @private
   * @returns {boolean} True if localStorage is available
   */
  _checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Filters state to only include persistent slices.
   * 
   * @private
   * @param {import('./types.js').GameState} state - Full state
   * @returns {Partial<import('./types.js').GameState>} Filtered state with only persistent slices
   */
  _filterToPersistentSlices(state) {
    const persistentState = {};
    
    for (const sliceName of PERSISTENT_SLICES) {
      if (state[sliceName]) {
        persistentState[sliceName] = deepClone(state[sliceName]);
      }
    }
    
    return persistentState;
  }

  /**
   * Merges persistent state with default state.
   * 
   * @private
   * @param {Partial<import('./types.js').GameState>} persistentState - Loaded persistent state
   * @returns {import('./types.js').GameState} Merged complete state
   */
  _mergeWithDefaults(persistentState) {
    const defaultState = createDefaultGameState();
    
    // Merge each persistent slice
    for (const sliceName of PERSISTENT_SLICES) {
      if (persistentState[sliceName]) {
        defaultState[sliceName] = {
          ...defaultState[sliceName],
          ...persistentState[sliceName],
        };
      }
    }
    
    return defaultState;
  }

  /**
   * Clears corrupted data from localStorage.
   * 
   * **Validates: Requirements 5.3**
   * 
   * @private
   */
  _clearCorruptedData() {
    try {
      localStorage.removeItem(this._storageKey);
      console.warn(`[StatePersister] Cleared corrupted data from ${this._storageKey}`);
    } catch (error) {
      console.error(`[StatePersister] Failed to clear corrupted data: ${error.message}`);
    }
  }
}

export default StatePersister;