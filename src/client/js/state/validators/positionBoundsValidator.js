/**
 * Position Bounds Validator
 * 
 * Validates that entity position values remain within valid map boundaries:
 * - x >= 0 AND x <= mapWidth
 * - y >= 0 AND y <= mapHeight
 * 
 * **Validates: Requirements 4.2**
 * 
 * @module state/validators/positionBoundsValidator
 */

import { createValidationError } from '../types.js';

/**
 * Validates player position bounds for the players slice.
 * 
 * For each player in the slice, validates:
 * - x >= 0 AND x <= mapWidth
 * - y >= 0 AND y <= mapHeight
 * 
 * @param {import('../types.js').PlayersSlice} playersSlice - The players slice to validate
 * @param {import('../types.js').GameState} [fullState=null] - Full state for map bounds context
 * @returns {import('../types.js').ValidationError[]} Array of validation errors (empty if valid)
 */
export function validatePlayerPositionBounds(playersSlice, fullState = null) {
  const errors = [];
  
  // Guard against null/undefined slice
  if (!playersSlice || !playersSlice.byId) {
    return errors;
  }
  
  // Get map bounds from full state, use defaults if not available
  const mapWidth = fullState?.map?.width ?? 2000;
  const mapHeight = fullState?.map?.height ?? 2000;
  
  // Validate each player's position
  for (const playerId of Object.keys(playersSlice.byId)) {
    const player = playersSlice.byId[playerId];
    
    // Skip if player object is invalid
    if (!player || typeof player.x !== 'number' || typeof player.y !== 'number') {
      continue;
    }
    
    // Validate x >= 0
    if (player.x < 0) {
      errors.push(createValidationError(
        `players.byId.${playerId}.x`,
        `Player x position must be >= 0, got ${player.x}`,
        player.x
      ));
    }
    
    // Validate x <= mapWidth
    if (player.x > mapWidth) {
      errors.push(createValidationError(
        `players.byId.${playerId}.x`,
        `Player x position must be <= mapWidth (${mapWidth}), got ${player.x}`,
        player.x
      ));
    }
    
    // Validate y >= 0
    if (player.y < 0) {
      errors.push(createValidationError(
        `players.byId.${playerId}.y`,
        `Player y position must be >= 0, got ${player.y}`,
        player.y
      ));
    }
    
    // Validate y <= mapHeight
    if (player.y > mapHeight) {
      errors.push(createValidationError(
        `players.byId.${playerId}.y`,
        `Player y position must be <= mapHeight (${mapHeight}), got ${player.y}`,
        player.y
      ));
    }
  }
  
  return errors;
}

/**
 * Validates bullet position bounds for the bullets slice.
 * 
 * For each bullet in the slice, validates:
 * - x >= 0 AND x <= mapWidth
 * - y >= 0 AND y <= mapHeight
 * 
 * @param {import('../types.js').BulletsSlice} bulletsSlice - The bullets slice to validate
 * @param {import('../types.js').GameState} [fullState=null] - Full state for map bounds context
 * @returns {import('../types.js').ValidationError[]} Array of validation errors (empty if valid)
 */
export function validateBulletPositionBounds(bulletsSlice, fullState = null) {
  const errors = [];
  
  // Guard against null/undefined slice
  if (!bulletsSlice || !bulletsSlice.byId) {
    return errors;
  }
  
  // Get map bounds from full state, use defaults if not available
  const mapWidth = fullState?.map?.width ?? 2000;
  const mapHeight = fullState?.map?.height ?? 2000;
  
  // Validate each bullet's position
  for (const bulletId of Object.keys(bulletsSlice.byId)) {
    const bullet = bulletsSlice.byId[bulletId];
    
    // Skip if bullet object is invalid
    if (!bullet || typeof bullet.x !== 'number' || typeof bullet.y !== 'number') {
      continue;
    }
    
    // Validate x >= 0
    if (bullet.x < 0) {
      errors.push(createValidationError(
        `bullets.byId.${bulletId}.x`,
        `Bullet x position must be >= 0, got ${bullet.x}`,
        bullet.x
      ));
    }
    
    // Validate x <= mapWidth
    if (bullet.x > mapWidth) {
      errors.push(createValidationError(
        `bullets.byId.${bulletId}.x`,
        `Bullet x position must be <= mapWidth (${mapWidth}), got ${bullet.x}`,
        bullet.x
      ));
    }
    
    // Validate y >= 0
    if (bullet.y < 0) {
      errors.push(createValidationError(
        `bullets.byId.${bulletId}.y`,
        `Bullet y position must be >= 0, got ${bullet.y}`,
        bullet.y
      ));
    }
    
    // Validate y <= mapHeight
    if (bullet.y > mapHeight) {
      errors.push(createValidationError(
        `bullets.byId.${bulletId}.y`,
        `Bullet y position must be <= mapHeight (${mapHeight}), got ${bullet.y}`,
        bullet.y
      ));
    }
  }
  
  return errors;
}

/**
 * Validates powerup position bounds for the powerups slice.
 * 
 * For each powerup in the slice, validates:
 * - x >= 0 AND x <= mapWidth
 * - y >= 0 AND y <= mapHeight
 * 
 * @param {import('../types.js').PowerupsSlice} powerupsSlice - The powerups slice to validate
 * @param {import('../types.js').GameState} [fullState=null] - Full state for map bounds context
 * @returns {import('../types.js').ValidationError[]} Array of validation errors (empty if valid)
 */
export function validatePowerupPositionBounds(powerupsSlice, fullState = null) {
  const errors = [];
  
  // Guard against null/undefined slice
  if (!powerupsSlice || !powerupsSlice.byId) {
    return errors;
  }
  
  // Get map bounds from full state, use defaults if not available
  const mapWidth = fullState?.map?.width ?? 2000;
  const mapHeight = fullState?.map?.height ?? 2000;
  
  // Validate each powerup's position
  for (const powerupId of Object.keys(powerupsSlice.byId)) {
    const powerup = powerupsSlice.byId[powerupId];
    
    // Skip if powerup object is invalid
    if (!powerup || typeof powerup.x !== 'number' || typeof powerup.y !== 'number') {
      continue;
    }
    
    // Validate x >= 0
    if (powerup.x < 0) {
      errors.push(createValidationError(
        `powerups.byId.${powerupId}.x`,
        `Powerup x position must be >= 0, got ${powerup.x}`,
        powerup.x
      ));
    }
    
    // Validate x <= mapWidth
    if (powerup.x > mapWidth) {
      errors.push(createValidationError(
        `powerups.byId.${powerupId}.x`,
        `Powerup x position must be <= mapWidth (${mapWidth}), got ${powerup.x}`,
        powerup.x
      ));
    }
    
    // Validate y >= 0
    if (powerup.y < 0) {
      errors.push(createValidationError(
        `powerups.byId.${powerupId}.y`,
        `Powerup y position must be >= 0, got ${powerup.y}`,
        powerup.y
      ));
    }
    
    // Validate y <= mapHeight
    if (powerup.y > mapHeight) {
      errors.push(createValidationError(
        `powerups.byId.${powerupId}.y`,
        `Powerup y position must be <= mapHeight (${mapHeight}), got ${powerup.y}`,
        powerup.y
      ));
    }
  }
  
  return errors;
}

export default {
  validatePlayerPositionBounds,
  validateBulletPositionBounds,
  validatePowerupPositionBounds,
};
