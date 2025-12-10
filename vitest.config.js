import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable globals for describe, it, expect
    globals: true,
    
    // Test environment
    environment: 'node',
    
    // Include patterns for test files
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'audit-tool/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'
    ],
    
    // Exclude patterns
    exclude: ['node_modules', 'dist', '.git', '**/setup.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/client/js/state/**/*.js'],
      exclude: ['src/client/js/state/__tests__/**']
    },
    
    // Timeout for tests (property-based tests may need more time)
    testTimeout: 30000,
    
    // Reporter
    reporters: ['verbose'],
    
    // Minimum iterations for property-based tests
    // Note: fast-check default is 100, which meets our requirement
  }
});
