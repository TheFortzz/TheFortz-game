/**
 * Setup verification tests
 * 
 * These tests verify that the audit tool is properly configured
 * and all dependencies are available.
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Audit Tool Setup', () => {
  it('should have all required directories', () => {
    const directories = [
      'src',
      'src/parsers',
      'src/analyzer',
      'src/reporter',
      'src/fixer',
      'src/types',
      'tests',
      'output'
    ];

    directories.forEach(dir => {
      expect(existsSync(resolve(dir))).toBe(true);
    });
  });

  it('should have main entry point', () => {
    expect(existsSync(resolve('src/index.js'))).toBe(true);
  });

  it('should have configuration files', () => {
    expect(existsSync(resolve('package.json'))).toBe(true);
    expect(existsSync(resolve('tsconfig.json'))).toBe(true);
    expect(existsSync(resolve('README.md'))).toBe(true);
  });

  it('should have type definitions', () => {
    expect(existsSync(resolve('src/types/index.js'))).toBe(true);
  });
});

describe('Dependencies', () => {
  it('should be able to import cheerio', async () => {
    const cheerio = await import('cheerio');
    expect(cheerio).toBeDefined();
    expect(cheerio.load).toBeDefined();
  });

  it('should be able to import @babel/parser', async () => {
    const babel = await import('@babel/parser');
    expect(babel).toBeDefined();
    expect(babel.parse).toBeDefined();
  });

  it('should be able to import glob', async () => {
    const { glob } = await import('glob');
    expect(glob).toBeDefined();
  });

  it('should be able to import fs-extra', async () => {
    const fs = await import('fs-extra');
    expect(fs).toBeDefined();
    expect(fs.readFile).toBeDefined();
    expect(fs.writeFile).toBeDefined();
  });

  it('should be able to import fast-check', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(fc.assert).toBeDefined();
  });
});
