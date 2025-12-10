/**
 * Tests for State Utilities
 * 
 * @module state/__tests__/utils.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { deepClone, generateId, calculateChecksum, deepEqual } from '../utils/index.js';

describe('State Utilities', () => {
  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(null)).toBe(null);
      expect(deepClone(true)).toBe(true);
    });

    it('should create independent copies of objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      
      cloned.b.c = 999;
      expect(original.b.c).toBe(2);
    });

    it('should clone arrays', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(original);
      
      cloned[1][0] = 999;
      expect(original[1][0]).toBe(2);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('calculateChecksum', () => {
    it('should produce consistent checksums for same input', () => {
      const state = { players: [], bullets: [] };
      const checksum1 = calculateChecksum(state);
      const checksum2 = calculateChecksum(state);
      expect(checksum1).toBe(checksum2);
    });

    it('should produce different checksums for different inputs', () => {
      const state1 = { value: 1 };
      const state2 = { value: 2 };
      expect(calculateChecksum(state1)).not.toBe(calculateChecksum(state2));
    });
  });

  describe('deepEqual', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('a', 'a')).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('a', 'b')).toBe(false);
    });

    it('should compare objects deeply', () => {
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    // Property-based test for deepEqual
    it('should satisfy reflexivity: deepEqual(x, x) === true', () => {
      fc.assert(
        fc.property(fc.jsonValue(), (value) => {
          return deepEqual(value, value) === true;
        }),
        { numRuns: 100 }
      );
    });

    // Property-based test for deepClone
    it('should satisfy: deepEqual(x, deepClone(x)) === true', () => {
      fc.assert(
        fc.property(fc.jsonValue(), (value) => {
          return deepEqual(value, deepClone(value)) === true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
