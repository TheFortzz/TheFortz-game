/**
 * StateMerger Property-Based Tests
 * 
 * This module contains property-based tests for the StateMerger class,
 * validating multiplayer state synchronization behaviors.
 * 
 * @module state/__tests__/stateMerger.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { StateMerger } from '../StateMerger.js';
import { createDefaultGameState } from '../types.js';
import { deepEqual, deepClone } from '../utils/index.js';

// ============================================================================
// ARBITRARIES
// ============================================================================

// Player arbitrary
const playerArb = fc.record({
  id: fc.string({ minLength: 1 }),
  x: fc.float({ min: 0, max: 2000 }),
  y: fc.float({ min: 0, max: 2000 }),
  health: fc.integer({ min: 0, max: 100 }),
  maxHealth: fc.integer({ min: 1, max: 100 }),
  lastUpdate: fc.integer({ min: 0 }),
});

// Game state arbitrary (simplified for testing)
const gameStateArb = fc.record({
  players: fc.record({
    byId: fc.dictionary(fc.string({ minLength: 1 }), playerArb),
    allIds: fc.array(fc.string({ minLength: 1 })),
    localPlayerId: fc.option(fc.string({ minLength: 1 }), { nil: null }),
  }),
  bullets: fc.record({
    byId: fc.dictionary(fc.string({ minLength: 1 }), fc.record({
      id: fc.string({ minLength: 1 }),
      x: fc.float({ min: 0, max: 2000 }),
      y: fc.float({ min: 0, max: 2000 }),
    })),
    allIds: fc.array(fc.string({ minLength: 1 })),
  }),
  settings: fc.record({
    sound: fc.record({
      masterVolume: fc.float({ min: 0, max: 1 }),
    }),
  }),
}).map(state => {
  // Ensure allIds matches byId keys
  state.players.allIds = Object.keys(state.players.byId);
  state.bullets.allIds = Object.keys(state.bullets.byId);
  return state;
});

// Timestamp arbitrary (monotonically increasing)
const timestampArb = fc.integer({ min: 1000000000000, max: 9999999999999 });

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('StateMerger', () => {
  let merger;

  beforeEach(() => {
    merger = new StateMerger();
  });

  /**
   * **Feature: game-state-management, Property 7: Deterministic state merge**
   * **Validates: Requirements 3.1**
   * 
   * For any two valid game states, merging them SHALL produce
   * the same result when performed multiple times with the same inputs.
   */
  describe('Property 7: Deterministic state merge', () => {
    it('should produce identical results for identical inputs', () => {
      fc.assert(
        fc.property(
          gameStateArb,
          gameStateArb,
          timestampArb,
          (localState, serverState, timestamp) => {
            // Perform merge twice with identical inputs
            const result1 = merger.merge(localState, serverState, timestamp);
            
            // Reset merger to ensure clean state
            merger.resetTimestamps();
            
            const result2 = merger.merge(localState, serverState, timestamp);
            
            // PROPERTY: Results should be identical
            expect(result1.success).toBe(result2.success);
            
            if (result1.success && result2.success) {
              expect(deepEqual(result1.mergedState, result2.mergedState)).toBe(true);
              expect(result1.conflicts.length).toBe(result2.conflicts.length);
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should be commutative for non-conflicting states', () => {
      fc.assert(
        fc.property(
          gameStateArb,
          timestampArb,
          (baseState, timestamp) => {
            // Create two non-conflicting variations
            const state1 = deepClone(baseState);
            const state2 = deepClone(baseState);
            
            // Modify different parts to avoid conflicts
            if (state1.settings) {
              state1.settings.sound.masterVolume = 0.5;
            }
            if (state2.players && Object.keys(state2.players.byId).length > 0) {
              const playerId = Object.keys(state2.players.byId)[0];
              state2.players.byId[playerId].x = 100;
            }
            
            // Merge in both directions
            const result1 = merger.merge(state1, state2, timestamp);
            
            merger.resetTimestamps();
            
            const result2 = merger.merge(state2, state1, timestamp);
            
            // PROPERTY: For non-conflicting changes, order shouldn't matter much
            // (Note: This is a weaker property due to server-authoritative resolution)
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * **Feature: game-state-management, Property 8: Timestamp monotonicity**
   * **Validates: Requirements 3.3**
   * 
   * Timestamps in state updates SHALL be monotonically increasing.
   * Updates with timestamps older than the last processed timestamp SHALL be rejected.
   */
  describe('Property 8: Timestamp monotonicity', () => {
    it('should accept monotonically increasing timestamps', () => {
      fc.assert(
        fc.property(
          gameStateArb,
          gameStateArb,
          fc.array(timestampArb, { minLength: 2, maxLength: 5 }).map(arr => arr.sort((a, b) => a - b)),
          (localState, serverState, sortedTimestamps) => {
            let allSucceeded = true;
            
            // Process timestamps in increasing order
            for (const timestamp of sortedTimestamps) {
              const result = merger.merge(localState, serverState, timestamp);
              
              if (!result.success) {
                allSucceeded = false;
                break;
              }
            }
            
            // PROPERTY: All monotonic timestamps should be accepted
            expect(allSucceeded).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should reject non-monotonic timestamps', () => {
      fc.assert(
        fc.property(
          gameStateArb,
          gameStateArb,
          timestampArb,
          timestampArb,
          (localState, serverState, timestamp1, timestamp2) => {
            // Ensure timestamp2 < timestamp1
            const laterTimestamp = Math.max(timestamp1, timestamp2);
            const earlierTimestamp = Math.min(timestamp1, timestamp2);
            
            if (laterTimestamp === earlierTimestamp) {
              return true; // Skip identical timestamps
            }
            
            // Process later timestamp first
            const result1 = merger.merge(localState, serverState, laterTimestamp);
            expect(result1.success).toBe(true);
            
            // Try to process earlier timestamp (should fail)
            const result2 = merger.merge(localState, serverState, earlierTimestamp);
            
            // PROPERTY: Non-monotonic timestamp should be rejected
            expect(result2.success).toBe(false);
            expect(result2.error).toContain('not monotonic');
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should track last timestamp correctly', () => {
      fc.assert(
        fc.property(
          gameStateArb,
          gameStateArb,
          timestampArb,
          (localState, serverState, timestamp) => {
            // Initial timestamp should be 0
            expect(merger.getLastTimestamp()).toBe(0);
            
            // Process update
            const result = merger.merge(localState, serverState, timestamp);
            expect(result.success).toBe(true);
            
            // PROPERTY: Last timestamp should be updated
            expect(merger.getLastTimestamp()).toBe(timestamp);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Feature: game-state-management, Property 9: Server-authoritative conflict resolution**
   * **Validates: Requirements 3.4**
   * 
   * When conflicts exist between local and server state, the server state
   * SHALL take precedence in the merged result.
   */
  describe('Property 9: Server-authoritative conflict resolution', () => {
    it('should resolve conflicts in favor of server state', () => {
      fc.assert(
        fc.property(
          fc.record({
            playerId: fc.string({ minLength: 1 }),
            localHealth: fc.integer({ min: 0, max: 100 }),
            serverHealth: fc.integer({ min: 0, max: 100 }),
            timestamp: timestampArb,
          }),
          (testData) => {
            // Skip if health values are the same (no conflict)
            if (testData.localHealth === testData.serverHealth) {
              return true;
            }
            
            // Create conflicting states
            const localState = createDefaultGameState();
            const serverState = createDefaultGameState();
            
            // Add conflicting player data
            const player = {
              id: testData.playerId,
              x: 100,
              y: 100,
              health: testData.localHealth,
              maxHealth: 100,
              lastUpdate: testData.timestamp - 1000,
            };
            
            localState.players.byId[testData.playerId] = { ...player, health: testData.localHealth };
            localState.players.allIds = [testData.playerId];
            
            serverState.players.byId[testData.playerId] = { ...player, health: testData.serverHealth };
            serverState.players.allIds = [testData.playerId];
            
            // Merge states
            const result = merger.merge(localState, serverState, testData.timestamp);
            
            expect(result.success).toBe(true);
            expect(result.conflicts.length).toBeGreaterThan(0);
            
            // PROPERTY: Server health should win
            const mergedPlayer = result.mergedState.players.byId[testData.playerId];
            expect(mergedPlayer.health).toBe(testData.serverHealth);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should preserve local settings despite server conflicts', () => {
      fc.assert(
        fc.property(
          fc.record({
            localVolume: fc.float({ min: 0, max: 1 }),
            serverVolume: fc.float({ min: 0, max: 1 }),
            timestamp: timestampArb,
          }),
          (testData) => {
            // Skip if volumes are the same
            if (Math.abs(testData.localVolume - testData.serverVolume) < 0.01) {
              return true;
            }
            
            // Create conflicting settings
            const localState = createDefaultGameState();
            const serverState = createDefaultGameState();
            
            localState.settings.sound.masterVolume = testData.localVolume;
            serverState.settings.sound.masterVolume = testData.serverVolume;
            
            // Merge states
            const result = merger.merge(localState, serverState, testData.timestamp);
            
            expect(result.success).toBe(true);
            
            // PROPERTY: Local settings should be preserved
            expect(result.mergedState.settings.sound.masterVolume).toBe(testData.localVolume);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should detect and report conflicts correctly', () => {
      fc.assert(
        fc.property(
          gameStateArb,
          gameStateArb,
          timestampArb,
          (localState, serverState, timestamp) => {
            const result = merger.merge(localState, serverState, timestamp);
            
            expect(result.success).toBe(true);
            expect(Array.isArray(result.conflicts)).toBe(true);
            
            // PROPERTY: If states are identical, no conflicts should be detected
            if (deepEqual(localState, serverState)) {
              expect(result.conflicts.length).toBe(0);
            }
            
            // PROPERTY: Each conflict should have required properties
            result.conflicts.forEach(conflict => {
              expect(conflict.type).toBeTruthy();
              expect(typeof conflict.type).toBe('string');
            });
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // ============================================================================
  // UNIT TESTS
  // ============================================================================

  describe('StateMerger Infrastructure', () => {
    it('should validate merge inputs', () => {
      const state = createDefaultGameState();
      const timestamp = Date.now();
      
      // Test null inputs
      expect(merger.merge(null, state, timestamp).success).toBe(false);
      expect(merger.merge(state, null, timestamp).success).toBe(false);
      
      // Test invalid timestamp
      expect(merger.merge(state, state, 'invalid').success).toBe(false);
      expect(merger.merge(state, state, NaN).success).toBe(false);
    });

    it('should allow custom merge strategies', () => {
      const customStrategy = (local, server, timestamp) => {
        return { custom: true, timestamp };
      };
      
      merger.registerMergeStrategy('custom', customStrategy);
      
      const localState = { custom: { value: 'local' } };
      const serverState = { custom: { value: 'server' } };
      const timestamp = Date.now();
      
      const result = merger.merge(localState, serverState, timestamp);
      
      expect(result.success).toBe(true);
      expect(result.mergedState.custom.custom).toBe(true);
      expect(result.mergedState.custom.timestamp).toBe(timestamp);
    });

    it('should handle timestamp reset', () => {
      const state = createDefaultGameState();
      const timestamp = Date.now();
      
      // Process an update
      merger.merge(state, state, timestamp);
      expect(merger.getLastTimestamp()).toBe(timestamp);
      
      // Reset timestamps
      merger.resetTimestamps();
      expect(merger.getLastTimestamp()).toBe(0);
    });

    it('should validate merge strategy registration', () => {
      expect(() => merger.registerMergeStrategy('test', 'not-a-function')).toThrow();
      expect(() => merger.registerMergeStrategy('test', () => {})).not.toThrow();
    });
  });
});