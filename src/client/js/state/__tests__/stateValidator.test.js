/**
 * Unit Tests for StateValidator Infrastructure
 * 
 * Tests the base validator infrastructure including:
 * - ValidationResult and ValidationError creation
 * - Validator registry for slice-specific validators
 * - StateValidator class methods
 * 
 * Property-Based Tests:
 * - **Feature: game-state-management, Property 10: Health bounds invariant**
 * 
 * @module state/__tests__/stateValidator.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  StateValidator,
  combineValidationResults,
  prefixValidationError,
  validateNumberBounds,
  validateNonEmptyString,
  validatePlayerHealthBounds,
  validatePlayerPositionBounds,
  validateBulletPositionBounds,
  validatePowerupPositionBounds,
} from '../validators/index.js';
import {
  createDefaultGameState,
  createValidationResult,
  createValidationError,
  createAction,
  createPlayer,
  createBullet,
  createPowerUp,
  PLAYER_ACTIONS,
} from '../types.js';

describe('StateValidator Infrastructure', () => {
  beforeEach(() => {
    // Clear all validators before each test
    StateValidator.clearValidators();
  });

  afterEach(() => {
    // Clean up after each test
    StateValidator.clearValidators();
  });

  describe('ValidationResult and ValidationError', () => {
    it('should create a valid ValidationResult', () => {
      const result = createValidationResult(true, []);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should create an invalid ValidationResult with errors', () => {
      const error = createValidationError('path.to.field', 'Error message', 'badValue');
      const result = createValidationResult(false, [error]);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('path.to.field');
      expect(result.errors[0].message).toBe('Error message');
      expect(result.errors[0].value).toBe('badValue');
    });

    it('should create a ValidationError with all properties', () => {
      const error = createValidationError('players.byId.p1.health', 'Health out of bounds', -10);
      
      expect(error.path).toBe('players.byId.p1.health');
      expect(error.message).toBe('Health out of bounds');
      expect(error.value).toBe(-10);
    });
  });

  describe('StateValidator.validate', () => {
    it('should return valid result for valid default state', () => {
      const validator = new StateValidator();
      const state = createDefaultGameState();
      
      const result = validator.validate(state);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for null state', () => {
      const validator = new StateValidator();
      
      const result = validator.validate(null);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('state');
    });

    it('should return invalid result for non-object state', () => {
      const validator = new StateValidator();
      
      const result = validator.validate('not an object');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('StateValidator.validateSlice', () => {
    it('should return valid result for defined slice', () => {
      const validator = new StateValidator();
      const state = createDefaultGameState();
      
      const result = validator.validateSlice('players', state.players, state);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for undefined slice', () => {
      const validator = new StateValidator();
      
      const result = validator.validateSlice('players', undefined, null);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('undefined');
    });

    it('should run registered slice validators', () => {
      // Register a custom validator that always fails
      StateValidator.registerSliceValidator('players', (sliceData) => {
        return [createValidationError('players.test', 'Test error', sliceData)];
      });

      const validator = new StateValidator();
      const state = createDefaultGameState();
      
      const result = validator.validateSlice('players', state.players, state);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('players.test');
    });
  });

  describe('StateValidator.validateAction', () => {
    it('should return valid result for valid action', () => {
      const validator = new StateValidator();
      const state = createDefaultGameState();
      const action = createAction(PLAYER_ACTIONS.PLAYER_MOVE, { id: 'p1', x: 100, y: 100 });
      
      const result = validator.validateAction(action, state);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for null action', () => {
      const validator = new StateValidator();
      const state = createDefaultGameState();
      
      const result = validator.validateAction(null, state);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('action');
    });

    it('should return invalid result for action without type', () => {
      const validator = new StateValidator();
      const state = createDefaultGameState();
      const action = { payload: {}, timestamp: Date.now(), source: 'local' };
      
      const result = validator.validateAction(action, state);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'action.type')).toBe(true);
    });

    it('should return invalid result for action with invalid source', () => {
      const validator = new StateValidator();
      const state = createDefaultGameState();
      const action = { type: 'TEST', payload: {}, timestamp: Date.now(), source: 'invalid' };
      
      const result = validator.validateAction(action, state);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'action.source')).toBe(true);
    });

    it('should run registered action validators', () => {
      // Register a custom action validator
      StateValidator.registerActionValidator(PLAYER_ACTIONS.PLAYER_MOVE, (action, state) => {
        return [createValidationError('action.payload', 'Custom validation error', action.payload)];
      });

      const validator = new StateValidator();
      const state = createDefaultGameState();
      const action = createAction(PLAYER_ACTIONS.PLAYER_MOVE, { id: 'p1', x: 100, y: 100 });
      
      const result = validator.validateAction(action, state);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'action.payload')).toBe(true);
    });
  });

  describe('Validator Registry', () => {
    it('should register and retrieve slice validators', () => {
      const mockValidator = () => [];
      
      StateValidator.registerSliceValidator('players', mockValidator);
      
      const validators = StateValidator.getSliceValidators('players');
      expect(validators).toContain(mockValidator);
    });

    it('should register multiple validators for same slice', () => {
      const validator1 = () => [];
      const validator2 = () => [];
      
      StateValidator.registerSliceValidator('players', validator1);
      StateValidator.registerSliceValidator('players', validator2);
      
      const validators = StateValidator.getSliceValidators('players');
      expect(validators).toHaveLength(2);
      expect(validators).toContain(validator1);
      expect(validators).toContain(validator2);
    });

    it('should register and retrieve action validators', () => {
      const mockValidator = () => [];
      
      StateValidator.registerActionValidator('TEST_ACTION', mockValidator);
      
      const validator = StateValidator.getActionValidator('TEST_ACTION');
      expect(validator).toBe(mockValidator);
    });

    it('should return empty array for unregistered slice', () => {
      const validators = StateValidator.getSliceValidators('nonexistent');
      expect(validators).toEqual([]);
    });

    it('should return undefined for unregistered action', () => {
      const validator = StateValidator.getActionValidator('NONEXISTENT');
      expect(validator).toBeUndefined();
    });

    it('should check if slice has validators', () => {
      expect(StateValidator.hasSliceValidators('players')).toBe(false);
      
      StateValidator.registerSliceValidator('players', () => []);
      
      expect(StateValidator.hasSliceValidators('players')).toBe(true);
    });

    it('should check if action has validator', () => {
      expect(StateValidator.hasActionValidator('TEST')).toBe(false);
      
      StateValidator.registerActionValidator('TEST', () => []);
      
      expect(StateValidator.hasActionValidator('TEST')).toBe(true);
    });

    it('should clear all validators', () => {
      StateValidator.registerSliceValidator('players', () => []);
      StateValidator.registerActionValidator('TEST', () => []);
      
      StateValidator.clearValidators();
      
      expect(StateValidator.hasSliceValidators('players')).toBe(false);
      expect(StateValidator.hasActionValidator('TEST')).toBe(false);
    });

    it('should throw error when registering non-function as validator', () => {
      expect(() => {
        StateValidator.registerSliceValidator('players', 'not a function');
      }).toThrow('Validator must be a function');

      expect(() => {
        StateValidator.registerActionValidator('TEST', 'not a function');
      }).toThrow('Validator must be a function');
    });
  });

  describe('Helper Functions', () => {
    describe('combineValidationResults', () => {
      it('should combine multiple valid results', () => {
        const result1 = createValidationResult(true, []);
        const result2 = createValidationResult(true, []);
        
        const combined = combineValidationResults(result1, result2);
        
        expect(combined.valid).toBe(true);
        expect(combined.errors).toHaveLength(0);
      });

      it('should combine results with errors', () => {
        const error1 = createValidationError('path1', 'Error 1', 'val1');
        const error2 = createValidationError('path2', 'Error 2', 'val2');
        const result1 = createValidationResult(false, [error1]);
        const result2 = createValidationResult(false, [error2]);
        
        const combined = combineValidationResults(result1, result2);
        
        expect(combined.valid).toBe(false);
        expect(combined.errors).toHaveLength(2);
      });

      it('should handle null/undefined results', () => {
        const result1 = createValidationResult(true, []);
        
        const combined = combineValidationResults(result1, null, undefined);
        
        expect(combined.valid).toBe(true);
      });
    });

    describe('prefixValidationError', () => {
      it('should prefix error path', () => {
        const error = createValidationError('health', 'Invalid health', -10);
        
        const prefixed = prefixValidationError('players.byId.p1', error);
        
        expect(prefixed.path).toBe('players.byId.p1.health');
        expect(prefixed.message).toBe('Invalid health');
        expect(prefixed.value).toBe(-10);
      });

      it('should handle empty prefix', () => {
        const error = createValidationError('health', 'Invalid health', -10);
        
        const prefixed = prefixValidationError('', error);
        
        expect(prefixed.path).toBe('health');
      });
    });

    describe('validateNumberBounds', () => {
      it('should return null for valid number in bounds', () => {
        const error = validateNumberBounds(50, 0, 100, 'health');
        expect(error).toBeNull();
      });

      it('should return null for number at min bound', () => {
        const error = validateNumberBounds(0, 0, 100, 'health');
        expect(error).toBeNull();
      });

      it('should return null for number at max bound', () => {
        const error = validateNumberBounds(100, 0, 100, 'health');
        expect(error).toBeNull();
      });

      it('should return error for number below min', () => {
        const error = validateNumberBounds(-10, 0, 100, 'health');
        expect(error).not.toBeNull();
        expect(error.path).toBe('health');
        expect(error.message).toContain('between 0 and 100');
      });

      it('should return error for number above max', () => {
        const error = validateNumberBounds(150, 0, 100, 'health');
        expect(error).not.toBeNull();
        expect(error.path).toBe('health');
      });

      it('should return error for NaN', () => {
        const error = validateNumberBounds(NaN, 0, 100, 'health');
        expect(error).not.toBeNull();
        expect(error.message).toContain('valid number');
      });

      it('should return error for non-number', () => {
        const error = validateNumberBounds('50', 0, 100, 'health');
        expect(error).not.toBeNull();
      });
    });

    describe('validateNonEmptyString', () => {
      it('should return null for valid non-empty string', () => {
        const error = validateNonEmptyString('hello', 'name');
        expect(error).toBeNull();
      });

      it('should return error for empty string', () => {
        const error = validateNonEmptyString('', 'name');
        expect(error).not.toBeNull();
        expect(error.path).toBe('name');
      });

      it('should return error for whitespace-only string', () => {
        const error = validateNonEmptyString('   ', 'name');
        expect(error).not.toBeNull();
      });

      it('should return error for non-string', () => {
        const error = validateNonEmptyString(123, 'name');
        expect(error).not.toBeNull();
      });

      it('should return error for null', () => {
        const error = validateNonEmptyString(null, 'name');
        expect(error).not.toBeNull();
      });
    });
  });
});

// ============================================================================
// PROPERTY-BASED TESTS
// ============================================================================

/**
 * Arbitrary for generating valid player data with health values
 */
const playerHealthArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  x: fc.float({ min: 0, max: 2000, noNaN: true }),
  y: fc.float({ min: 0, max: 2000, noNaN: true }),
  health: fc.integer({ min: -50, max: 200 }), // Include invalid values to test validation
  maxHealth: fc.integer({ min: 1, max: 200 }),
});

/**
 * Arbitrary for generating a game state with players having various health values
 */
const gameStateWithPlayersHealthArb = fc.array(
  playerHealthArb,
  { minLength: 1, maxLength: 5 }
).map(players => {
  const state = createDefaultGameState();
  players.forEach(p => {
    const player = createPlayer(p.id, {
      x: p.x,
      y: p.y,
      health: p.health,
      maxHealth: p.maxHealth,
    });
    state.players.byId[p.id] = player;
    state.players.allIds.push(p.id);
  });
  return state;
});

/**
 * **Feature: game-state-management, Property 10: Health bounds invariant**
 * **Validates: Requirements 4.1**
 * 
 * For any player in the state, health SHALL be >= 0 AND health SHALL be <= maxHealth.
 */
describe('Property 10: Health bounds invariant', () => {
  beforeEach(() => {
    StateValidator.clearValidators();
  });

  afterEach(() => {
    StateValidator.clearValidators();
  });

  it('should detect health below zero for any player', () => {
    fc.assert(
      fc.property(
        gameStateWithPlayersHealthArb,
        (state) => {
          // Register the health bounds validator
          StateValidator.registerSliceValidator('players', validatePlayerHealthBounds);
          
          const validator = new StateValidator();
          const result = validator.validateSlice('players', state.players, state);
          
          // Check if any player has health < 0
          const hasNegativeHealth = Object.values(state.players.byId).some(
            player => player.health < 0
          );
          
          // PROPERTY: If any player has negative health, validation should fail
          if (hasNegativeHealth) {
            return result.valid === false && 
                   result.errors.some(e => e.path.includes('health') && e.message.includes('>= 0'));
          }
          
          // If no negative health, check for health > maxHealth
          const hasExcessHealth = Object.values(state.players.byId).some(
            player => player.health > player.maxHealth
          );
          
          if (hasExcessHealth) {
            return result.valid === false &&
                   result.errors.some(e => e.path.includes('health') && e.message.includes('maxHealth'));
          }
          
          // All health values are valid
          return result.valid === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect health above maxHealth for any player', () => {
    fc.assert(
      fc.property(
        gameStateWithPlayersHealthArb,
        (state) => {
          StateValidator.registerSliceValidator('players', validatePlayerHealthBounds);
          
          const validator = new StateValidator();
          const result = validator.validateSlice('players', state.players, state);
          
          // Check if any player has health > maxHealth
          const hasExcessHealth = Object.values(state.players.byId).some(
            player => player.health > player.maxHealth
          );
          
          // PROPERTY: If any player has health > maxHealth, validation should fail
          if (hasExcessHealth) {
            return result.valid === false &&
                   result.errors.some(e => e.path.includes('health'));
          }
          
          // Check for negative health
          const hasNegativeHealth = Object.values(state.players.byId).some(
            player => player.health < 0
          );
          
          if (hasNegativeHealth) {
            return result.valid === false;
          }
          
          // All health values are valid
          return result.valid === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid health values within bounds [0, maxHealth]', () => {
    // Generate only valid health values
    const validPlayerHealthArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
      x: fc.float({ min: 0, max: 2000, noNaN: true }),
      y: fc.float({ min: 0, max: 2000, noNaN: true }),
      maxHealth: fc.integer({ min: 1, max: 200 }),
    }).chain(p => 
      fc.integer({ min: 0, max: p.maxHealth }).map(health => ({
        ...p,
        health,
      }))
    );

    const validGameStateArb = fc.array(
      validPlayerHealthArb,
      { minLength: 1, maxLength: 5 }
    ).map(players => {
      const state = createDefaultGameState();
      players.forEach(p => {
        const player = createPlayer(p.id, {
          x: p.x,
          y: p.y,
          health: p.health,
          maxHealth: p.maxHealth,
        });
        state.players.byId[p.id] = player;
        state.players.allIds.push(p.id);
      });
      return state;
    });

    fc.assert(
      fc.property(
        validGameStateArb,
        (state) => {
          StateValidator.registerSliceValidator('players', validatePlayerHealthBounds);
          
          const validator = new StateValidator();
          const result = validator.validateSlice('players', state.players, state);
          
          // PROPERTY: All players have valid health, so validation should pass
          return result.valid === true && result.errors.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should report correct error path for each invalid player', () => {
    fc.assert(
      fc.property(
        gameStateWithPlayersHealthArb,
        (state) => {
          StateValidator.registerSliceValidator('players', validatePlayerHealthBounds);
          
          const validator = new StateValidator();
          const result = validator.validateSlice('players', state.players, state);
          
          // For each player with invalid health, there should be an error with correct path
          for (const playerId of Object.keys(state.players.byId)) {
            const player = state.players.byId[playerId];
            const expectedPath = `players.byId.${playerId}.health`;
            
            const hasInvalidHealth = player.health < 0 || player.health > player.maxHealth;
            const hasErrorForPlayer = result.errors.some(e => e.path === expectedPath);
            
            // PROPERTY: Invalid health should have corresponding error with correct path
            if (hasInvalidHealth && !hasErrorForPlayer) {
              return false;
            }
            
            // PROPERTY: Valid health should not have error
            if (!hasInvalidHealth && hasErrorForPlayer) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ============================================================================
// PROPERTY 11: POSITION BOUNDS INVARIANT
// ============================================================================

/**
 * Arbitrary for generating player data with position values (including invalid)
 */
const playerPositionArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  x: fc.float({ min: -500, max: 3000, noNaN: true }), // Include invalid values
  y: fc.float({ min: -500, max: 3000, noNaN: true }), // Include invalid values
  health: fc.integer({ min: 0, max: 100 }),
  maxHealth: fc.constant(100),
});

/**
 * Arbitrary for generating bullet data with position values (including invalid)
 */
const bulletPositionArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  x: fc.float({ min: -500, max: 3000, noNaN: true }),
  y: fc.float({ min: -500, max: 3000, noNaN: true }),
  ownerId: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
});

/**
 * Arbitrary for generating powerup data with position values (including invalid)
 */
const powerupPositionArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  x: fc.float({ min: -500, max: 3000, noNaN: true }),
  y: fc.float({ min: -500, max: 3000, noNaN: true }),
  type: fc.constantFrom('health', 'speed', 'damage', 'shield'),
});

/**
 * Arbitrary for generating map dimensions
 */
const mapDimensionsArb = fc.record({
  width: fc.integer({ min: 500, max: 5000 }),
  height: fc.integer({ min: 500, max: 5000 }),
});

/**
 * **Feature: game-state-management, Property 11: Position bounds invariant**
 * **Validates: Requirements 4.2**
 * 
 * For any entity with position in the state, x SHALL be within [0, mapWidth] 
 * AND y SHALL be within [0, mapHeight].
 */
describe('Property 11: Position bounds invariant', () => {
  beforeEach(() => {
    StateValidator.clearValidators();
  });

  afterEach(() => {
    StateValidator.clearValidators();
  });

  describe('Player position bounds', () => {
    it('should detect player x position below zero', () => {
      fc.assert(
        fc.property(
          fc.array(playerPositionArb, { minLength: 1, maxLength: 5 }),
          mapDimensionsArb,
          (players, mapDims) => {
            const state = createDefaultGameState();
            state.map.width = mapDims.width;
            state.map.height = mapDims.height;
            
            players.forEach(p => {
              const player = createPlayer(p.id, {
                x: p.x,
                y: p.y,
                health: p.health,
                maxHealth: p.maxHealth,
              });
              state.players.byId[p.id] = player;
              state.players.allIds.push(p.id);
            });
            
            StateValidator.registerSliceValidator('players', validatePlayerPositionBounds);
            
            const validator = new StateValidator();
            const result = validator.validateSlice('players', state.players, state);
            
            // Check if any player has x < 0
            const hasNegativeX = Object.values(state.players.byId).some(
              player => player.x < 0
            );
            
            // PROPERTY: If any player has negative x, validation should fail with correct error
            if (hasNegativeX) {
              return result.valid === false && 
                     result.errors.some(e => e.path.includes('.x') && e.message.includes('>= 0'));
            }
            
            // Check for x > mapWidth
            const hasExcessX = Object.values(state.players.byId).some(
              player => player.x > mapDims.width
            );
            
            if (hasExcessX) {
              return result.valid === false &&
                     result.errors.some(e => e.path.includes('.x') && e.message.includes('mapWidth'));
            }
            
            // Check for y < 0
            const hasNegativeY = Object.values(state.players.byId).some(
              player => player.y < 0
            );
            
            if (hasNegativeY) {
              return result.valid === false &&
                     result.errors.some(e => e.path.includes('.y') && e.message.includes('>= 0'));
            }
            
            // Check for y > mapHeight
            const hasExcessY = Object.values(state.players.byId).some(
              player => player.y > mapDims.height
            );
            
            if (hasExcessY) {
              return result.valid === false &&
                     result.errors.some(e => e.path.includes('.y') && e.message.includes('mapHeight'));
            }
            
            // All positions are valid
            return result.valid === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid player positions within bounds [0, mapWidth] x [0, mapHeight]', () => {
      fc.assert(
        fc.property(
          mapDimensionsArb,
          (mapDims) => {
            // Generate players with valid positions based on map dimensions
            const validPlayerArb = fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
              x: fc.float({ min: 0, max: mapDims.width, noNaN: true }),
              y: fc.float({ min: 0, max: mapDims.height, noNaN: true }),
            });
            
            return fc.assert(
              fc.property(
                fc.array(validPlayerArb, { minLength: 1, maxLength: 5 }),
                (players) => {
                  const state = createDefaultGameState();
                  state.map.width = mapDims.width;
                  state.map.height = mapDims.height;
                  
                  players.forEach(p => {
                    const player = createPlayer(p.id, { x: p.x, y: p.y });
                    state.players.byId[p.id] = player;
                    state.players.allIds.push(p.id);
                  });
                  
                  StateValidator.registerSliceValidator('players', validatePlayerPositionBounds);
                  
                  const validator = new StateValidator();
                  const result = validator.validateSlice('players', state.players, state);
                  
                  // PROPERTY: All players have valid positions, so validation should pass
                  return result.valid === true && result.errors.length === 0;
                }
              ),
              { numRuns: 50 }
            );
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should report correct error path for each invalid player position', () => {
      fc.assert(
        fc.property(
          fc.array(playerPositionArb, { minLength: 1, maxLength: 5 }),
          mapDimensionsArb,
          (players, mapDims) => {
            const state = createDefaultGameState();
            state.map.width = mapDims.width;
            state.map.height = mapDims.height;
            
            players.forEach(p => {
              const player = createPlayer(p.id, { x: p.x, y: p.y });
              state.players.byId[p.id] = player;
              state.players.allIds.push(p.id);
            });
            
            StateValidator.registerSliceValidator('players', validatePlayerPositionBounds);
            
            const validator = new StateValidator();
            const result = validator.validateSlice('players', state.players, state);
            
            // For each player with invalid position, there should be an error with correct path
            for (const playerId of Object.keys(state.players.byId)) {
              const player = state.players.byId[playerId];
              
              const hasInvalidX = player.x < 0 || player.x > mapDims.width;
              const hasInvalidY = player.y < 0 || player.y > mapDims.height;
              
              const expectedXPath = `players.byId.${playerId}.x`;
              const expectedYPath = `players.byId.${playerId}.y`;
              
              const hasXError = result.errors.some(e => e.path === expectedXPath);
              const hasYError = result.errors.some(e => e.path === expectedYPath);
              
              // PROPERTY: Invalid x should have corresponding error
              if (hasInvalidX && !hasXError) {
                return false;
              }
              
              // PROPERTY: Invalid y should have corresponding error
              if (hasInvalidY && !hasYError) {
                return false;
              }
              
              // PROPERTY: Valid x should not have error
              if (!hasInvalidX && hasXError) {
                return false;
              }
              
              // PROPERTY: Valid y should not have error
              if (!hasInvalidY && hasYError) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Bullet position bounds', () => {
    it('should detect bullet positions outside map bounds', () => {
      fc.assert(
        fc.property(
          fc.array(bulletPositionArb, { minLength: 1, maxLength: 5 }),
          mapDimensionsArb,
          (bullets, mapDims) => {
            const state = createDefaultGameState();
            state.map.width = mapDims.width;
            state.map.height = mapDims.height;
            
            bullets.forEach(b => {
              const bullet = createBullet(b.id, b.ownerId, { x: b.x, y: b.y });
              state.bullets.byId[b.id] = bullet;
              state.bullets.allIds.push(b.id);
            });
            
            StateValidator.registerSliceValidator('bullets', validateBulletPositionBounds);
            
            const validator = new StateValidator();
            const result = validator.validateSlice('bullets', state.bullets, state);
            
            // Check if any bullet has invalid position
            const hasInvalidPosition = Object.values(state.bullets.byId).some(
              bullet => bullet.x < 0 || bullet.x > mapDims.width || 
                       bullet.y < 0 || bullet.y > mapDims.height
            );
            
            // PROPERTY: If any bullet has invalid position, validation should fail
            if (hasInvalidPosition) {
              return result.valid === false;
            }
            
            // All positions are valid
            return result.valid === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid bullet positions within bounds', () => {
      fc.assert(
        fc.property(
          mapDimensionsArb,
          (mapDims) => {
            const validBulletArb = fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
              x: fc.float({ min: 0, max: mapDims.width, noNaN: true }),
              y: fc.float({ min: 0, max: mapDims.height, noNaN: true }),
              ownerId: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            });
            
            return fc.assert(
              fc.property(
                fc.array(validBulletArb, { minLength: 1, maxLength: 5 }),
                (bullets) => {
                  const state = createDefaultGameState();
                  state.map.width = mapDims.width;
                  state.map.height = mapDims.height;
                  
                  bullets.forEach(b => {
                    const bullet = createBullet(b.id, b.ownerId, { x: b.x, y: b.y });
                    state.bullets.byId[b.id] = bullet;
                    state.bullets.allIds.push(b.id);
                  });
                  
                  StateValidator.registerSliceValidator('bullets', validateBulletPositionBounds);
                  
                  const validator = new StateValidator();
                  const result = validator.validateSlice('bullets', state.bullets, state);
                  
                  // PROPERTY: All bullets have valid positions, so validation should pass
                  return result.valid === true && result.errors.length === 0;
                }
              ),
              { numRuns: 50 }
            );
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Powerup position bounds', () => {
    it('should detect powerup positions outside map bounds', () => {
      fc.assert(
        fc.property(
          fc.array(powerupPositionArb, { minLength: 1, maxLength: 5 }),
          mapDimensionsArb,
          (powerups, mapDims) => {
            const state = createDefaultGameState();
            state.map.width = mapDims.width;
            state.map.height = mapDims.height;
            
            powerups.forEach(p => {
              const powerup = createPowerUp(p.id, p.type, { x: p.x, y: p.y });
              state.powerups.byId[p.id] = powerup;
              state.powerups.allIds.push(p.id);
            });
            
            StateValidator.registerSliceValidator('powerups', validatePowerupPositionBounds);
            
            const validator = new StateValidator();
            const result = validator.validateSlice('powerups', state.powerups, state);
            
            // Check if any powerup has invalid position
            const hasInvalidPosition = Object.values(state.powerups.byId).some(
              powerup => powerup.x < 0 || powerup.x > mapDims.width || 
                        powerup.y < 0 || powerup.y > mapDims.height
            );
            
            // PROPERTY: If any powerup has invalid position, validation should fail
            if (hasInvalidPosition) {
              return result.valid === false;
            }
            
            // All positions are valid
            return result.valid === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid powerup positions within bounds', () => {
      fc.assert(
        fc.property(
          mapDimensionsArb,
          (mapDims) => {
            const validPowerupArb = fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
              x: fc.float({ min: 0, max: mapDims.width, noNaN: true }),
              y: fc.float({ min: 0, max: mapDims.height, noNaN: true }),
              type: fc.constantFrom('health', 'speed', 'damage', 'shield'),
            });
            
            return fc.assert(
              fc.property(
                fc.array(validPowerupArb, { minLength: 1, maxLength: 5 }),
                (powerups) => {
                  const state = createDefaultGameState();
                  state.map.width = mapDims.width;
                  state.map.height = mapDims.height;
                  
                  powerups.forEach(p => {
                    const powerup = createPowerUp(p.id, p.type, { x: p.x, y: p.y });
                    state.powerups.byId[p.id] = powerup;
                    state.powerups.allIds.push(p.id);
                  });
                  
                  StateValidator.registerSliceValidator('powerups', validatePowerupPositionBounds);
                  
                  const validator = new StateValidator();
                  const result = validator.validateSlice('powerups', state.powerups, state);
                  
                  // PROPERTY: All powerups have valid positions, so validation should pass
                  return result.valid === true && result.errors.length === 0;
                }
              ),
              { numRuns: 50 }
            );
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
