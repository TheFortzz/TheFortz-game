/**
 * Integration tests for JavaScriptParser with real code samples
 */

import { describe, it, expect } from 'vitest';
import { JavaScriptParser } from '../src/parsers/JavaScriptParser.js';
import { join } from 'path';

describe('JavaScriptParser Integration', () => {
  it('should parse real JavaScript files from the project', () => {
    // Test with a subset of the actual project files
    // Go up one level from audit-tool to project root
    const jsDir = join(process.cwd(), '..', 'src', 'client', 'js', 'ui');
    
    const parser = new JavaScriptParser(jsDir);
    const result = parser.parse();

    // Should find functions
    expect(result.functions.size).toBeGreaterThan(0);
    
    // Should find DOM queries
    expect(result.domQueries.length).toBeGreaterThan(0);
    
    // Should track function calls
    expect(result.functionCalls.size).toBeGreaterThan(0);
  });

  it('should handle complex JavaScript patterns', () => {
    const jsDir = join(process.cwd(), '..', 'src', 'client', 'js', 'systems');
    
    const parser = new JavaScriptParser(jsDir);
    const result = parser.parse();

    // Verify we can parse without errors
    expect(result.functions).toBeInstanceOf(Map);
    expect(Array.isArray(result.domQueries)).toBe(true);
    expect(result.functionCalls).toBeInstanceOf(Map);
  });
});
