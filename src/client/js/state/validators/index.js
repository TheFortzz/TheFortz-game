/**
 * State Validators
 * 
 * This module exports all state validation functions.
 * Validators ensure state integrity after modifications.
 * 
 * @module state/validators
 */

export {
  StateValidator,
  combineValidationResults,
  prefixValidationError,
  validateNumberBounds,
  validateNonEmptyString,
} from './StateValidator.js';

export { validatePlayerHealthBounds } from './healthBoundsValidator.js';

export {
  validatePlayerPositionBounds,
  validateBulletPositionBounds,
  validatePowerupPositionBounds,
} from './positionBoundsValidator.js';

export {
  registerAllValidators,
  clearAllValidators,
} from './registerValidators.js';
