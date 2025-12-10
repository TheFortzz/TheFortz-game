/**
 * State Validator Infrastructure
 * 
 * This module provides the base validator infrastructure for validating game state.
 * It includes a validator registry for slice-specific validators and the main
 * StateValidator class that orchestrates validation.
 * 
 * @module state/validators/StateValidator
 */

import {
  createValidationResult,
  createValidationError,
  getSliceNames,
  ACTION_TYPES,
} from '../types.js';

// ============================================================================
// VALIDATOR REGISTRY
// ============================================================================

/**
 * Registry for slice-specific validators.
 * Maps slice names to arrays of validator functions.
 * 
 * @type {Map<string, Array<SliceValidatorFn>>}
 */
const sliceValidatorRegistry = new Map();

/**
 * Registry for action validators.
 * Maps action types to validator functions.
 * 
 * @type {Map<string, ActionValidatorFn>}
 */
const actionValidatorRegistry = new Map();

/**
 * @callback SliceValidatorFn
 * @param {*} sliceData - The slice data to validate
 * @param {import('../types.js').GameState} fullState - The full game state for context
 * @returns {import('../types.js').ValidationError[]} Array of validation errors (empty if valid)
 */

/**
 * @callback ActionValidatorFn
 * @param {import('../types.js').StateAction} action - The action to validate
 * @param {import('../types.js').GameState} currentState - The current game state
 * @returns {import('../types.js').ValidationError[]} Array of validation errors (empty if valid)
 */

// ============================================================================
// STATE VALIDATOR CLASS
// ============================================================================

/**
 * StateValidator class that validates game state integrity.
 * 
 * Provides methods to:
 * - Validate entire state
 * - Validate specific slices
 * - Validate actions before applying
 * - Register custom validators
 */
export class StateValidator {
  /**
   * Creates a new StateValidator instance.
   */
  constructor() {
    // Instance can have additional configuration if needed
  }

  /**
   * Validates the entire game state.
   * Runs all registered slice validators.
   * 
   * @param {import('../types.js').GameState} state - The state to validate
   * @returns {import('../types.js').ValidationResult} Validation result
   */
  validate(state) {
    const errors = [];

    if (!state || typeof state !== 'object') {
      errors.push(createValidationError(
        'state',
        'State must be a non-null object',
        state
      ));
      return createValidationResult(false, errors);
    }

    // Validate each slice
    const sliceNames = getSliceNames();
    for (const sliceName of sliceNames) {
      const sliceData = state[sliceName];
      const sliceErrors = this.validateSlice(sliceName, sliceData, state);
      errors.push(...sliceErrors.errors);
    }

    return createValidationResult(errors.length === 0, errors);
  }

  /**
   * Validates a specific state slice.
   * 
   * @param {string} sliceName - Name of the slice to validate
   * @param {*} sliceData - The slice data to validate
   * @param {import('../types.js').GameState} [fullState=null] - Optional full state for context
   * @returns {import('../types.js').ValidationResult} Validation result
   */
  validateSlice(sliceName, sliceData, fullState = null) {
    const errors = [];

    // Check if slice exists
    if (sliceData === undefined) {
      errors.push(createValidationError(
        sliceName,
        `Slice '${sliceName}' is undefined`,
        sliceData
      ));
      return createValidationResult(false, errors);
    }

    // Run registered validators for this slice
    const validators = sliceValidatorRegistry.get(sliceName) || [];
    for (const validator of validators) {
      const validatorErrors = validator(sliceData, fullState);
      errors.push(...validatorErrors);
    }

    return createValidationResult(errors.length === 0, errors);
  }

  /**
   * Validates an action before it is applied to state.
   * 
   * @param {import('../types.js').StateAction} action - The action to validate
   * @param {import('../types.js').GameState} currentState - The current game state
   * @returns {import('../types.js').ValidationResult} Validation result
   */
  validateAction(action, currentState) {
    const errors = [];

    // Basic action structure validation
    if (!action || typeof action !== 'object') {
      errors.push(createValidationError(
        'action',
        'Action must be a non-null object',
        action
      ));
      return createValidationResult(false, errors);
    }

    if (typeof action.type !== 'string' || action.type.length === 0) {
      errors.push(createValidationError(
        'action.type',
        'Action type must be a non-empty string',
        action.type
      ));
      return createValidationResult(false, errors);
    }

    if (typeof action.timestamp !== 'number' || isNaN(action.timestamp)) {
      errors.push(createValidationError(
        'action.timestamp',
        'Action timestamp must be a valid number',
        action.timestamp
      ));
      return createValidationResult(false, errors);
    }

    if (action.source !== 'local' && action.source !== 'server') {
      errors.push(createValidationError(
        'action.source',
        "Action source must be 'local' or 'server'",
        action.source
      ));
      return createValidationResult(false, errors);
    }

    // Validate action type is known
    const knownActionTypes = Object.values(ACTION_TYPES);
    if (!knownActionTypes.includes(action.type)) {
      errors.push(createValidationError(
        'action.type',
        `Unknown action type: ${action.type}`,
        action.type
      ));
      return createValidationResult(false, errors);
    }

    // Run registered action validator if exists
    const actionValidator = actionValidatorRegistry.get(action.type);
    if (actionValidator) {
      const validatorErrors = actionValidator(action, currentState);
      errors.push(...validatorErrors);
    }

    return createValidationResult(errors.length === 0, errors);
  }

  /**
   * Registers a validator function for a specific slice.
   * Multiple validators can be registered for the same slice.
   * 
   * @param {string} sliceName - Name of the slice to validate
   * @param {SliceValidatorFn} validator - Validator function
   */
  static registerSliceValidator(sliceName, validator) {
    if (typeof validator !== 'function') {
      throw new Error('Validator must be a function');
    }

    if (!sliceValidatorRegistry.has(sliceName)) {
      sliceValidatorRegistry.set(sliceName, []);
    }
    sliceValidatorRegistry.get(sliceName).push(validator);
  }

  /**
   * Registers a validator function for a specific action type.
   * Only one validator can be registered per action type.
   * 
   * @param {string} actionType - Action type to validate
   * @param {ActionValidatorFn} validator - Validator function
   */
  static registerActionValidator(actionType, validator) {
    if (typeof validator !== 'function') {
      throw new Error('Validator must be a function');
    }
    actionValidatorRegistry.set(actionType, validator);
  }

  /**
   * Clears all registered validators.
   * Useful for testing.
   */
  static clearValidators() {
    sliceValidatorRegistry.clear();
    actionValidatorRegistry.clear();
  }

  /**
   * Gets all registered slice validators for a slice.
   * 
   * @param {string} sliceName - Name of the slice
   * @returns {Array<SliceValidatorFn>} Array of validator functions
   */
  static getSliceValidators(sliceName) {
    return sliceValidatorRegistry.get(sliceName) || [];
  }

  /**
   * Gets the registered action validator for an action type.
   * 
   * @param {string} actionType - Action type
   * @returns {ActionValidatorFn|undefined} Validator function or undefined
   */
  static getActionValidator(actionType) {
    return actionValidatorRegistry.get(actionType);
  }

  /**
   * Checks if a slice has any registered validators.
   * 
   * @param {string} sliceName - Name of the slice
   * @returns {boolean} True if validators are registered
   */
  static hasSliceValidators(sliceName) {
    const validators = sliceValidatorRegistry.get(sliceName);
    return validators !== undefined && validators.length > 0;
  }

  /**
   * Checks if an action type has a registered validator.
   * 
   * @param {string} actionType - Action type
   * @returns {boolean} True if a validator is registered
   */
  static hasActionValidator(actionType) {
    return actionValidatorRegistry.has(actionType);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Combines multiple validation results into one.
 * 
 * @param {...import('../types.js').ValidationResult} results - Validation results to combine
 * @returns {import('../types.js').ValidationResult} Combined validation result
 */
export function combineValidationResults(...results) {
  const allErrors = [];
  for (const result of results) {
    if (result && result.errors) {
      allErrors.push(...result.errors);
    }
  }
  return createValidationResult(allErrors.length === 0, allErrors);
}

/**
 * Creates a validation error with a prefixed path.
 * Useful for nested validation.
 * 
 * @param {string} prefix - Path prefix
 * @param {import('../types.js').ValidationError} error - Original error
 * @returns {import('../types.js').ValidationError} Error with prefixed path
 */
export function prefixValidationError(prefix, error) {
  const newPath = prefix ? `${prefix}.${error.path}` : error.path;
  return createValidationError(newPath, error.message, error.value);
}

/**
 * Validates that a number is within bounds.
 * 
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {string} path - Path for error reporting
 * @returns {import('../types.js').ValidationError|null} Error or null if valid
 */
export function validateNumberBounds(value, min, max, path) {
  if (typeof value !== 'number' || isNaN(value)) {
    return createValidationError(path, `${path} must be a valid number`, value);
  }
  if (value < min || value > max) {
    return createValidationError(
      path,
      `${path} must be between ${min} and ${max}, got ${value}`,
      value
    );
  }
  return null;
}

/**
 * Validates that a value is a non-empty string.
 * 
 * @param {*} value - Value to validate
 * @param {string} path - Path for error reporting
 * @returns {import('../types.js').ValidationError|null} Error or null if valid
 */
export function validateNonEmptyString(value, path) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return createValidationError(path, `${path} must be a non-empty string`, value);
  }
  return null;
}

export default StateValidator;
