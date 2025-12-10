/**
 * Validator Registration
 * 
 * This module registers all slice validators with the StateValidator.
 * Call registerAllValidators() to set up validation for the StateManager.
 * 
 * @module state/validators/registerValidators
 */

import { StateValidator } from './StateValidator.js';
import { validatePlayerHealthBounds } from './healthBoundsValidator.js';
import {
  validatePlayerPositionBounds,
  validateBulletPositionBounds,
  validatePowerupPositionBounds,
} from './positionBoundsValidator.js';

/**
 * Registers all slice validators with the StateValidator.
 * This should be called once during application initialization.
 */
export function registerAllValidators() {
  // Register health bounds validator for players slice
  StateValidator.registerSliceValidator('players', validatePlayerHealthBounds);
  
  // Register position bounds validators
  StateValidator.registerSliceValidator('players', validatePlayerPositionBounds);
  StateValidator.registerSliceValidator('bullets', validateBulletPositionBounds);
  StateValidator.registerSliceValidator('powerups', validatePowerupPositionBounds);
}

/**
 * Clears all registered validators.
 * Useful for testing or resetting the validator state.
 */
export function clearAllValidators() {
  StateValidator.clearValidators();
}

export default registerAllValidators;
