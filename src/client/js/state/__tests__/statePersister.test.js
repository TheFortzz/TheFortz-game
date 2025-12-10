/**
 * StatePersister Property-Based Tests
 * 
 * This module contains property-based tests for the StatePersister class,
 * validating persistence, loading, and corruption handling behaviors.
 * 
 * @module state/__tests__/statePersister.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { StatePersister } from '../StatePersister.js';
import { 
  createDefaultGameState,
  createSettingsSlice,
  createProgressionSlice,
  PERSISTENT_SLICES
} from '../types.js';
import { deepEqual, deepClone } from '../utils/index.js';

// ============================================================================
// TEST SETUP
// ============================================================================

// Mock localStorage for testing
let mockStorage = {};
const localStorageMock = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { mockStorage = {}; },
};

// Replace global localStorage with mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ============================================================================
// ARBITRARIES
// ============================================================================

// Settings slice arbitrary
const settingsSliceArb = fc.record({
  sound: fc.record({
    masterVolume: fc.float({ min: 0, max: 1 }),
    musicVolume: fc.float({ min: 0, max: 1 }),
    sfxVolume: fc.float({ min: 0, max: 1 }),
    muted: fc.boolean(),
  }),
  graphics: fc.record({
    quality: fc.constantFrom('low', 'medium', 'high'),
    particles: fc.boolean(),
    shadows: fc.boolean(),
    antialiasing: fc.boolean(),
  }),
  controls: fc.record({
    mouseInvert: fc.boolean(),
    mouseSensitivity: fc.integer({ min: 1, max: 20 }).map(x => x / 10), // 0.1 to 2.0 in 0.1 increments
  }),
});

// Progression slice arbitrary
const progressionSliceArb = fc.record({
  currency: fc.integer({ min: 0, max: 1000000 }),
  experience: fc.integer({ min: 0, max: 1000000 }),
  level: fc.integer({ min: 1, max: 100 }),
  unlockedTanks: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 10 }),
  unlockedWeapons: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 10 }),
  achievements: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 20 }),
  statistics: fc.record({
    gamesPlayed: fc.integer({ min: 0, max: 10000 }),
    gamesWon: fc.integer({ min: 0, max: 10000 }),
    totalKills: fc.integer({ min: 0, max: 100000 }),
    totalDeaths: fc.integer({ min: 0, max: 100000 }),
  }),
});

// Game state with persistent slices
const gameStateWithPersistentSlicesArb = fc.record({
  settings: settingsSliceArb,
  progression: progressionSliceArb,
}).map(persistentData => {
  const state = createDefaultGameState();
  state.settings = persistentData.settings;
  state.progression = persistentData.progression;
  return state;
});

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('StatePersister', () => {
  let persister;

  beforeEach(() => {
    // Clear mock storage before each test
    mockStorage = {};
    persister = new StatePersister('test-game-state');
  });

  afterEach(() => {
    // Clean up after each test
    mockStorage = {};
  });

  /**
   * **Feature: game-state-management, Property 13: Persistence round-trip**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * For any valid GameState with persistent slices, persisting to storage
   * and then loading SHALL produce equivalent persistent data.
   */
  describe('Property 13: Persistence round-trip', () => {
    it('should produce equivalent persistent data after persist then load', () => {
      fc.assert(
        fc.property(
          gameStateWithPersistentSlicesArb,
          (originalState) => {
            // Persist the state
            const persistResult = persister.persist(originalState);
            
            // Persist should succeed
            if (!persistResult.success) {
              return false;
            }
            
            // Load the state back
            const loadResult = persister.load();
            
            // Load should succeed
            if (!loadResult.success) {
              return false;
            }
            
            const loadedState = loadResult.state;
            
            // PROPERTY: Persistent slices should be equivalent
            for (const sliceName of PERSISTENT_SLICES) {
              if (!deepEqual(originalState[sliceName], loadedState[sliceName])) {
                console.log(`Mismatch in slice ${sliceName}:`);
                console.log('Original:', JSON.stringify(originalState[sliceName], null, 2));
                console.log('Loaded:', JSON.stringify(loadedState[sliceName], null, 2));
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should merge loaded persistent data with default state', () => {
      fc.assert(
        fc.property(
          gameStateWithPersistentSlicesArb,
          (originalState) => {
            // Persist the state
            persister.persist(originalState);
            
            // Load the state back
            const loadResult = persister.load();
            const loadedState = loadResult.state;
            
            // PROPERTY: Non-persistent slices should have default values
            const defaultState = createDefaultGameState();
            
            // Check that non-persistent slices are defaults
            const nonPersistentSlices = Object.keys(defaultState).filter(
              key => !PERSISTENT_SLICES.includes(key)
            );
            
            for (const sliceName of nonPersistentSlices) {
              if (!deepEqual(defaultState[sliceName], loadedState[sliceName])) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: game-state-management, Property 14: Corrupted persistence fallback to defaults**
   * **Validates: Requirements 5.3**
   * 
   * When persisted data is corrupted or invalid, loading SHALL return
   * default state values and clear the corrupted data.
   */
  describe('Property 14: Corrupted persistence fallback to defaults', () => {
    it('should return defaults and clear corrupted JSON data', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('invalid json {'),
            fc.constant('{"incomplete": true'),
            fc.constant('[1,2,3]'), // Valid JSON but wrong structure
            fc.constant('null'),
            fc.constant(''),
          ),
          (corruptedData) => {
            // Manually set corrupted data in storage
            mockStorage['test-game-state'] = corruptedData;
            
            // Try to load
            const loadResult = persister.load();
            
            // Should succeed with defaults
            if (!loadResult.success) {
              return false;
            }
            
            // Should be default state
            const defaultState = createDefaultGameState();
            const isDefaultState = deepEqual(loadResult.state, defaultState);
            
            // Should have cleared corrupted data
            const isCleared = !persister.hasPersistedState();
            
            // Should have error message about corruption
            const hasCorruptionError = loadResult.error && 
                                       loadResult.error.includes('Corrupted');
            
            return isDefaultState && isCleared && hasCorruptionError;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle corrupted snapshot data', () => {
      fc.assert(
        fc.property(
          fc.record({
            state: fc.constant({}), // Invalid state structure
            timestamp: fc.integer(),
            version: fc.string(),
            checksum: fc.string(),
          }),
          (corruptedSnapshot) => {
            // Set corrupted snapshot in storage
            mockStorage['test-game-state'] = JSON.stringify(corruptedSnapshot);
            
            // Try to load
            const loadResult = persister.load();
            
            // Should succeed with defaults
            if (!loadResult.success) {
              return false;
            }
            
            // Should be default state
            const defaultState = createDefaultGameState();
            const isDefaultState = deepEqual(loadResult.state, defaultState);
            
            // Should have cleared corrupted data
            const isCleared = !persister.hasPersistedState();
            
            return isDefaultState && isCleared;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: game-state-management, Property 15: Selective persistence**
   * **Validates: Requirements 5.4**
   * 
   * Only slices marked as persistent SHALL be saved to storage.
   * Non-persistent slices SHALL NOT be included in persisted data.
   */
  describe('Property 15: Selective persistence', () => {
    it('should only persist slices marked as persistent', () => {
      fc.assert(
        fc.property(
          gameStateWithPersistentSlicesArb,
          (originalState) => {
            // Persist the state
            const persistResult = persister.persist(originalState);
            
            if (!persistResult.success) {
              return false;
            }
            
            // Check what was actually stored
            const storedData = mockStorage['test-game-state'];
            if (!storedData) {
              return false;
            }
            
            let parsedData;
            try {
              parsedData = JSON.parse(storedData);
            } catch (e) {
              return false;
            }
            
            // Should have state property (it's a snapshot)
            if (!parsedData.state) {
              return false;
            }
            
            const persistedState = parsedData.state;
            
            // PROPERTY: Should only contain persistent slices
            const persistedKeys = Object.keys(persistedState);
            const hasOnlyPersistentSlices = persistedKeys.every(key => 
              PERSISTENT_SLICES.includes(key)
            );
            
            // PROPERTY: Should contain all persistent slices that exist in original
            const hasAllPersistentSlices = PERSISTENT_SLICES.every(sliceName => 
              !originalState[sliceName] || persistedKeys.includes(sliceName)
            );
            
            return hasOnlyPersistentSlices && hasAllPersistentSlices;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not persist non-persistent slices', () => {
      fc.assert(
        fc.property(
          gameStateWithPersistentSlicesArb,
          (originalState) => {
            // Persist the state
            persister.persist(originalState);
            
            // Check stored data
            const storedData = mockStorage['test-game-state'];
            if (!storedData) {
              return false;
            }
            
            const parsedData = JSON.parse(storedData);
            const persistedState = parsedData.state;
            
            // PROPERTY: Non-persistent slices should not be in storage
            const nonPersistentSlices = ['players', 'bullets', 'powerups', 'map', 'weather', 'ui', 'meta'];
            
            for (const sliceName of nonPersistentSlices) {
              if (persistedState.hasOwnProperty(sliceName)) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // ============================================================================
  // UNIT TESTS
  // ============================================================================

  describe('StatePersister Infrastructure', () => {
    it('should handle missing localStorage gracefully', () => {
      // Create a persister that will detect no localStorage
      const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'localStorage');
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        configurable: true,
      });
      
      const persisterNoStorage = new StatePersister();
      const state = createDefaultGameState();
      
      // Persist should fail gracefully
      const persistResult = persisterNoStorage.persist(state);
      expect(persistResult.success).toBe(false);
      expect(persistResult.error).toContain('localStorage is not available');
      
      // Load should return defaults
      const loadResult = persisterNoStorage.load();
      expect(loadResult.success).toBe(true);
      expect(deepEqual(loadResult.state, createDefaultGameState())).toBe(true);
      
      // Restore localStorage
      if (originalDescriptor) {
        Object.defineProperty(global, 'localStorage', originalDescriptor);
      } else {
        delete global.localStorage;
        global.localStorage = localStorageMock;
      }
    });

    it('should handle storage quota exceeded errors', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      };
      
      const state = createDefaultGameState();
      const persistResult = persister.persist(state);
      
      expect(persistResult.success).toBe(false);
      expect(persistResult.error).toContain('Storage quota exceeded');
      
      // Restore original setItem
      localStorageMock.setItem = originalSetItem;
    });

    it('should provide utility methods', () => {
      const state = createDefaultGameState();
      
      // Initially no persisted state
      expect(persister.hasPersistedState()).toBe(false);
      
      // After persisting, should have state
      persister.persist(state);
      expect(persister.hasPersistedState()).toBe(true);
      
      // After clearing, should not have state
      const clearResult = persister.clear();
      expect(clearResult.success).toBe(true);
      expect(persister.hasPersistedState()).toBe(false);
      
      // Should return correct storage key
      expect(persister.getStorageKey()).toBe('test-game-state');
    });
  });
});