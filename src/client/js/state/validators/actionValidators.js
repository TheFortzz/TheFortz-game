/**
 * Action Validators - Payload validation for specific actions
 * 
 * This module provides validators for action payloads to ensure
 * they contain valid data before being applied to state.
 * 
 * @module state/validators/actionValidators
 */

import { 
  PLAYER_ACTIONS
} from '../types.js';
import { 
  validateNumberBounds,
  validateNonEmptyString
} from './StateValidator.js';
import { createValidationError } from '../types.js';

// ============================================================================
// PLAYER ACTION VALIDATORS
// ============================================================================

/**
 * Validates PLAYER_ADD action payload.
 * 
 * @param {import('../types.js').StateAction} action - The action to validate
 * @param {import('../types.js').GameState} state - Current state
 * @returns {import('../types.js').ValidationError[]} Array of validation errors
 */
export function validatePlayerAddAction(action, state) {
  const errors = [];
  const { payload } = action;

  if (!payload || typeof payload !== 'object') {
    errors.push(createValidationError(
      'action.payload',
      'Player add payload must be an object',
      payload
    ));
    return errors;
  }

  // Validate required fields
  const idError = validateNonEmptyString(payload.id, 'action.payload.id', 'Player ID');
  if (idError) errors.push(idError);
  
  // Additional check for whitespace-only IDs
  if (typeof payload.id === 'string' && payload.id.trim().length === 0) {
    errors.push(createValidationError(
      'action.payload.id',
      'Player ID cannot be empty or whitespace-only',
      payload.id
    ));
  }

  const healthError = validateNumberBounds(payload.health, 0, payload.maxHealth || 100, 'action.payload.health', 'Player health');
  if (healthError) errors.push(healthError);

  const maxHealthError = validateNumberBounds(payload.maxHealth, 1, 1000, 'action.payload.maxHealth', 'Player max health');
  if (maxHealthError) errors.push(maxHealthError);

  if (typeof payload.x !== 'number' || isNaN(payload.x)) {
    errors.push(createValidationError(
      'action.payload.x',
      'Player x position must be a valid number',
      payload.x
    ));
  }

  if (typeof payload.y !== 'number' || isNaN(payload.y)) {
    errors.push(createValidationError(
      'action.payload.y',
      'Player y position must be a valid number',
      payload.y
    ));
  }

  return errors;
}

/**
 * Validates PLAYER_SET_HEALTH action payload.
 * 
 * @param {import('../types.js').StateAction} action - The action to validate
 * @param {import('../types.js').GameState} state - Current state
 * @returns {import('../types.js').ValidationError[]} Array of validation errors
 */
export function validatePlayerSetHealthAction(action, state) {
  const errors = [];
  const { payload } = action;

  if (!payload || typeof payload !== 'object') {
    errors.push(createValidationError(
      'action.payload',
      'Player set health payload must be an object',
      payload
    ));
    return errors;
  }

  // Validate ID
  const idError = validateNonEmptyString(payload.id, 'action.payload.id', 'Player ID');
  if (idError) errors.push(idError);

  // Validate health bounds
  const healthError = validateNumberBounds(payload.health, 0, 1000, 'action.payload.health', 'Player health');
  if (healthError) errors.push(healthError);

  return errors;
}

/**
 * Validates PLAYER_MOVE action payload.
 * 
 * @param {import('../types.js').StateAction} action - The action to validate
 * @param {import('../types.js').GameState} state - Current state
 * @returns {import('../types.js').ValidationError[]} Array of validation errors
 */
export function validatePlayerMoveAction(action, state) {
  const errors = [];
  const { payload } = action;

  if (!payload || typeof payload !== 'object') {
    errors.push(createValidationError(
      'action.payload',
      'Player move payload must be an object',
      payload
    ));
    return errors;
  }

  // Validate ID
  const idError = validateNonEmptyString(payload.id, 'action.payload.id', 'Player ID');
  if (idError) errors.push(idError);

  // Validate position
  if (typeof payload.x !== 'number' || isNaN(payload.x)) {
    errors.push(createValidationError(
      'action.payload.x',
      'Player x position must be a valid number',
      payload.x
    ));
  }

  if (typeof payload.y !== 'number' || isNaN(payload.y)) {
    errors.push(createValidationError(
      'action.payload.y',
      'Player y position must be a valid number',
      payload.y
    ));
  }

  return errors;
}

// ============================================================================
// REGISTRATION FUNCTION
// ============================================================================

/**
 * Registers all action validators with the StateValidator.
 * 
 * @param {typeof import('./StateValidator.js').StateValidator} StateValidator - StateValidator class
 */
export function registerActionValidators(StateValidator) {
  // Player action validators
  StateValidator.registerActionValidator(PLAYER_ACTIONS.PLAYER_ADD, validatePlayerAddAction);
  StateValidator.registerActionValidator(PLAYER_ACTIONS.PLAYER_SET_HEALTH, validatePlayerSetHealthAction);
  StateValidator.registerActionValidator(PLAYER_ACTIONS.PLAYER_MOVE, validatePlayerMoveAction);
  
  // Add more action validators as needed
}

export default {
  validatePlayerAddAction,
  validatePlayerSetHealthAction,
  validatePlayerMoveAction,
  registerActionValidators,
};