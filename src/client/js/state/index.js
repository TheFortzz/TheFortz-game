/**
 * Game State Management System
 * 
 * This module provides centralized state management for TheFortz game.
 * It follows a unidirectional data flow pattern with immutable state updates,
 * event-driven subscriptions, validation, serialization, and persistence.
 * 
 * @module state
 */

// Export type definitions and factory functions
export * from './types.js';

// Export validators
export * from './validators/index.js';

// Export StateManager
export { StateManager } from './StateManager.js';

// Export StateSerializer
export { StateSerializer } from './StateSerializer.js';

// Export all state management components
export { StatePersister } from './StatePersister.js';
export { AssetFallbackManager } from './AssetFallbackManager.js';
export { StateMerger } from './StateMerger.js';
export { MigrationAdapter } from './MigrationAdapter.js';
