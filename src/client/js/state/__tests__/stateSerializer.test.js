/**
 * Property-Based Tests for StateSerializer
 * 
 * **Feature: game-state-management, Property 5: State serialization round-trip**
 * 
 * @module state/__tests__/stateSerializer.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { StateSerializer } from '../StateSerializer.js';
import { deepEqual } from '../utils/index.js';
import {
  createDefaultGameState,
  createPlayer,
  createBullet,
  createPowerUp,
  createMapSlice,
  createSettingsSlice,
  createProgressionSlice,
} from '../types.js';

// ============================================================================
// ARBITRARIES FOR GENERATING VALID GAME STATES
// ============================================================================

/**
 * Arbitrary for generating valid player objects
 */
const playerArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  x: fc.float({ min: 0, max: Math.fround(2000), noNaN: true }),
  y: fc.float({ min: 0, max: Math.fround(2000), noNaN: true }),
  angle: fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true }),
  turretAngle: fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true }),
  health: fc.integer({ min: 0, max: 100 }),
  maxHealth: fc.constant(100),
  shield: fc.integer({ min: 0, max: 50 }),
  maxShield: fc.constant(50),
  team: fc.constantFrom('red', 'blue', 'none'),
}).map(p => createPlayer(p.id, p));

/**
 * Arbitrary for generating valid bullet objects
 */
const bulletArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  ownerId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  x: fc.float({ min: 0, max: Math.fround(2000), noNaN: true }),
  y: fc.float({ min: 0, max: Math.fround(2000), noNaN: true }),
  vx: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
  vy: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
  damage: fc.integer({ min: 1, max: 100 }),
}).map(b => createBullet(b.id, b.ownerId, b));


/**
 * Arbitrary for generating valid powerup objects
 */
const powerupArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  type: fc.constantFrom('health', 'speed', 'damage', 'shield'),
  x: fc.float({ min: 0, max: Math.fround(2000), noNaN: true }),
  y: fc.float({ min: 0, max: Math.fround(2000), noNaN: true }),
  value: fc.integer({ min: 1, max: 100 }),
  duration: fc.integer({ min: 0, max: 30000 }),
}).map(p => createPowerUp(p.id, p.type, p));

/**
 * Arbitrary for generating valid game states with entities
 */
const gameStateArb = fc.record({
  players: fc.array(playerArb, { minLength: 0, maxLength: 5 }),
  bullets: fc.array(bulletArb, { minLength: 0, maxLength: 10 }),
  powerups: fc.array(powerupArb, { minLength: 0, maxLength: 5 }),
  mapWidth: fc.integer({ min: 500, max: 5000 }),
  mapHeight: fc.integer({ min: 500, max: 5000 }),
}).map(({ players, bullets, powerups, mapWidth, mapHeight }) => {
  const state = createDefaultGameState();
  
  // Add players
  players.forEach(p => {
    state.players.byId[p.id] = p;
    if (!state.players.allIds.includes(p.id)) {
      state.players.allIds.push(p.id);
    }
  });
  
  // Add bullets
  bullets.forEach(b => {
    state.bullets.byId[b.id] = b;
    if (!state.bullets.allIds.includes(b.id)) {
      state.bullets.allIds.push(b.id);
    }
  });
  
  // Add powerups
  powerups.forEach(p => {
    state.powerups.byId[p.id] = p;
    if (!state.powerups.allIds.includes(p.id)) {
      state.powerups.allIds.push(p.id);
    }
  });
  
  // Set map dimensions
  state.map.width = mapWidth;
  state.map.height = mapHeight;
  
  return state;
});

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('StateSerializer', () => {
  /**
   * **Feature: game-state-management, Property 5: State serialization round-trip**
   * **Validates: Requirements 2.3, 2.4**
   * 
   * For any valid GameState, serializing to a StateSnapshot and then 
   * restoring SHALL produce a state equivalent to the original.
   */
  describe('Property 5: State serialization round-trip', () => {
    it('should produce equivalent state after serialize then restore', () => {
      const serializer = new StateSerializer();

      fc.assert(
        fc.property(
          gameStateArb,
          (originalState) => {
            // Serialize the state to a snapshot
            const snapshot = serializer.serialize(originalState);
            
            // Restore the state from the snapshot
            const restoreResult = serializer.restore(snapshot);
            
            // Restore should succeed
            if (!restoreResult.success) {
              return false;
            }
            
            const restoredState = restoreResult.state;
            
            // PROPERTY: The restored state should be equivalent to the original
            return deepEqual(originalState, restoredState);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid checksum that matches on restore', () => {
      const serializer = new StateSerializer();

      fc.assert(
        fc.property(
          gameStateArb,
          (originalState) => {
            // Serialize the state
            const snapshot = serializer.serialize(originalState);
            
            // Checksum should be a non-empty string
            if (typeof snapshot.checksum !== 'string' || snapshot.checksum.length === 0) {
              return false;
            }
            
            // Restore should succeed with valid checksum
            const restoreResult = serializer.restore(snapshot);
            return restoreResult.success === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject snapshot with tampered checksum', () => {
      const serializer = new StateSerializer();

      fc.assert(
        fc.property(
          gameStateArb,
          (originalState) => {
            // Serialize the state
            const snapshot = serializer.serialize(originalState);
            
            // Tamper with the checksum
            const tamperedSnapshot = {
              ...snapshot,
              checksum: snapshot.checksum + 'tampered',
            };
            
            // Restore should fail with tampered checksum
            const restoreResult = serializer.restore(tamperedSnapshot);
            return restoreResult.success === false && 
                   restoreResult.error.includes('Checksum mismatch');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include version and timestamp in snapshot', () => {
      const serializer = new StateSerializer();

      fc.assert(
        fc.property(
          gameStateArb,
          (originalState) => {
            const beforeTime = Date.now();
            const snapshot = serializer.serialize(originalState);
            const afterTime = Date.now();
            
            // Version should be present
            const hasVersion = typeof snapshot.version === 'string' && 
                              snapshot.version.length > 0;
            
            // Timestamp should be within the test execution window
            const hasValidTimestamp = snapshot.timestamp >= beforeTime && 
                                      snapshot.timestamp <= afterTime;
            
            return hasVersion && hasValidTimestamp;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: game-state-management, Property 12: Pretty-print/parse round-trip**
   * **Validates: Requirements 4.4, 4.5**
   * 
   * For any valid StateSnapshot, pretty-printing to a string and then 
   * parsing back SHALL produce a snapshot equivalent to the original.
   */
  describe('Property 12: Pretty-print/parse round-trip', () => {
    it('should produce equivalent snapshot after prettyPrint then parse', () => {
      const serializer = new StateSerializer();

      fc.assert(
        fc.property(
          gameStateArb,
          (originalState) => {
            // Create a snapshot from the state
            const originalSnapshot = serializer.serialize(originalState);
            
            // Pretty-print the snapshot
            const prettyString = serializer.prettyPrint(originalSnapshot);
            
            // Parse the pretty-printed string back
            const parseResult = serializer.parse(prettyString);
            
            // Parse should succeed
            if (!parseResult.success) {
              return false;
            }
            
            const parsedSnapshot = parseResult.snapshot;
            
            // PROPERTY: The parsed snapshot should be equivalent to the original
            return deepEqual(originalSnapshot, parsedSnapshot);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle parsing errors gracefully', () => {
      const serializer = new StateSerializer();

      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('invalid json {'),
            fc.constant('{"_type": "NotASnapshot"}'),
            fc.constant('null'),
            fc.constant(''),
            fc.integer()
          ),
          (invalidInput) => {
            const parseResult = serializer.parse(invalidInput);
            
            // Should fail gracefully with error message
            return parseResult.success === false && 
                   typeof parseResult.error === 'string' &&
                   parseResult.error.length > 0;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve type annotations in pretty-printed output', () => {
      const serializer = new StateSerializer();

      fc.assert(
        fc.property(
          gameStateArb,
          (originalState) => {
            const snapshot = serializer.serialize(originalState);
            const prettyString = serializer.prettyPrint(snapshot);
            
            // Should contain type annotations
            const hasTypeAnnotations = prettyString.includes('"_type": "StateSnapshot"') &&
                                       prettyString.includes('"_type": "PlayersSlice"') &&
                                       prettyString.includes('"_type": "BulletsSlice"');
            
            // Should contain metadata
            const hasMetadata = prettyString.includes('"_version"') &&
                               prettyString.includes('"_timestamp"') &&
                               prettyString.includes('"_checksum"');
            
            return hasTypeAnnotations && hasMetadata;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
