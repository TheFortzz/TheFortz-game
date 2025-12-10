/**
 * Test Setup for State Management
 * 
 * This file configures the test environment for property-based testing
 * using fast-check with vitest.
 * 
 * @module state/__tests__/setup
 */

import * as fc from 'fast-check';

// Configure fast-check defaults
// Minimum 100 iterations per property test as per design requirements
fc.configureGlobal({
  numRuns: 100,
  verbose: false,
  endOnFailure: true
});

/**
 * Custom arbitraries for game state testing
 */

/**
 * Generate a valid player ID
 */
export const playerIdArb = fc.string({ minLength: 1, maxLength: 36 })
  .filter(s => s.trim().length > 0);

/**
 * Generate a valid position within map bounds
 * @param {number} maxX - Maximum X coordinate
 * @param {number} maxY - Maximum Y coordinate
 */
export const positionArb = (maxX = 2000, maxY = 2000) => fc.record({
  x: fc.float({ min: 0, max: maxX, noNaN: true }),
  y: fc.float({ min: 0, max: maxY, noNaN: true })
});

/**
 * Generate a valid health value
 * @param {number} maxHealth - Maximum health value
 */
export const healthArb = (maxHealth = 100) => fc.integer({ min: 0, max: maxHealth });

/**
 * Generate a valid velocity
 */
export const velocityArb = fc.record({
  x: fc.float({ min: -100, max: 100, noNaN: true }),
  y: fc.float({ min: -100, max: 100, noNaN: true })
});

/**
 * Generate a valid angle (in radians)
 */
export const angleArb = fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true });

/**
 * Generate a valid timestamp
 */
export const timestampArb = fc.integer({ min: 0, max: Date.now() + 1000000 });
