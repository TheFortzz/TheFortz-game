/**
 * Health Bounds Validator
 * 
 * Validates that player health values remain within valid bounds:
 * - health >= 0
 * - health <= maxHealth
 * 
 * **Validates: Requirements 4.1**
 * 
 * @module state/validators/healthBoundsValidator
 */

import { createValidationError } from '../types.js';

/**
 * Validates player health bounds for the players slice.
 * 
 * For each player in the slice, validates:
 * - health >= 0 (no negative health)
 * - health <= maxHealth (health cannot exceed maximum)
 * 
 * @param {import('../types.js').PlayersSlice} playersSlice - The players slice to validate
 * @param {import('../types.js').GameState} [fullState] - Optional full state for context
 * @returns {import('../types.js').ValidationError[]} Array of validation errors (empty if valid)
 */
export function validatePlayerHealthBounds(playersSlice, fullState = null) {
  const errors = [];
  
  // Guard against null/undefined slice
  if (!playersSlice || !playersSlice.byId) {
    return errors;
  }
  
  // Validate each player's health
  for (const playerId of Object.keys(playersSlice.byId)) {
    const player = playersSlice.byId[playerId];
    
    // Skip if player object is invalid
    if (!player || typeof player.health !== 'number' || typeof player.maxHealth !== 'number') {
      continue;
    }
    
    // Validate health >= 0
    if (player.health < 0) {
      errors.push(createValidationError(
        `players.byId.${playerId}.health`,
        `Player health must be >= 0, got ${player.health}`,
        player.health
      ));
    }
    
    // Validate health <= maxHealth
    if (player.health > player.maxHealth) {
      errors.push(createValidationError(
        `players.byId.${playerId}.health`,
        `Player health must be <= maxHealth (${player.maxHealth}), got ${player.health}`,
        player.health
      ));
    }
  }
  
  return errors;
}

export default validatePlayerHealthBounds;
