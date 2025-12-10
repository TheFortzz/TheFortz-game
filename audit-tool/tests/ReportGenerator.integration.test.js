/**
 * Integration tests for ReportGenerator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { resolve } from 'path';
import ReportGenerator from '../src/reporter/ReportGenerator.js';

describe('ReportGenerator Integration', () => {
  let sampleResults;
  const testOutputDir = resolve('audit-tool/tests/fixtures/test-output');

  beforeEach(() => {
    sampleResults = {
      orphanedFunctions: [
        {
          functionName: 'handleClick',
          filePath: 'src/app.js',
          lineNumber: 10,
          missingElementId: 'submitBtn',
          queryMethod: 'getElementById'
        }
      ],
      brokenHandlers: [
        {
          elementId: 'loginBtn',
          eventType: 'onclick',
          missingFunction: 'doLogin',
          htmlLineNumber: 25
        }
      ],
      unusedFunctions: [
        {
          functionName: 'oldHelper',
          filePath: 'src/utils.js',
          lineNumber: 50,
          callCount: 0
        }
      ],
      nonFunctionalElements: [
        {
          elementId: 'saveBtn',
          tagName: 'button',
          htmlLineNumber: 30,
          reason: 'No event handler or JavaScript reference found'
        }
      ],
      patternIssues: [
        {
          pattern: 'modal',
          elementId: 'loginModal',
          missingComponents: ['close function'],
          severity: 'warning'
        }
      ]
    };
  });

  afterEach(async () => {
    // Clean up test output directory
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('saveReport', () => {
    it('should save markdown report to file', async () => {
      const generator = new ReportGenerator(sampleResults);
      const result = await generator.saveReport('markdown', testOutputDir);
      
      expect(result.markdown).toBeDefined();
      expect(existsSync(result.markdown)).toBe(true);
      expect(result.markdown).toContain('audit-report.md');
    });

    it('should save JSON report to file', async () => {
      const generator = new ReportGenerator(sampleResults);
      const result = await generator.saveReport('json', testOutputDir);
      
      expect(result.json).toBeDefined();
      expect(existsSync(result.json)).toBe(true);
      expect(result.json).toContain('audit-report.json');
    });

    it('should save both formats when format is "both"', async () => {
      const generator = new ReportGenerator(sampleResults);
      const result = await generator.saveReport('both', testOutputDir);
      
      expect(result.markdown).toBeDefined();
      expect(result.json).toBeDefined();
      expect(existsSync(result.markdown)).toBe(true);
      expect(existsSync(result.json)).toBe(true);
    });

    it('should create output directory if it does not exist', async () => {
      const generator = new ReportGenerator(sampleResults);
      await generator.saveReport('both', testOutputDir);
      
      expect(existsSync(testOutputDir)).toBe(true);
    });
  });

  describe('full report generation', () => {
    it('should generate complete markdown report with all sections', async () => {
      const generator = new ReportGenerator(sampleResults);
      const markdown = generator.generateMarkdown();
      
      // Check structure
      expect(markdown).toContain('# JavaScript-HTML Connection Audit Report');
      expect(markdown).toContain('## Executive Summary');
      expect(markdown).toContain('## 1. Orphaned Functions');
      expect(markdown).toContain('## 2. Broken Event Handlers');
      expect(markdown).toContain('## 3. Unused Functions');
      expect(markdown).toContain('## 4. Non-Functional Interactive Elements');
      expect(markdown).toContain('## 5. UI Pattern Issues');
      expect(markdown).toContain('## Recommendations');
      
      // Check content
      expect(markdown).toContain('handleClick');
      expect(markdown).toContain('doLogin');
      expect(markdown).toContain('oldHelper');
      expect(markdown).toContain('saveBtn');
      expect(markdown).toContain('loginModal');
    });

    it('should generate complete JSON report with all data', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      // Check structure
      expect(json.metadata).toBeDefined();
      expect(json.metadata.generatedAt).toBeDefined();
      expect(json.summary).toBeDefined();
      expect(json.issues).toBeDefined();
      expect(json.recommendations).toBeDefined();
      
      // Check all issue types
      expect(json.issues.orphanedFunctions).toHaveLength(1);
      expect(json.issues.brokenHandlers).toHaveLength(1);
      expect(json.issues.unusedFunctions).toHaveLength(1);
      expect(json.issues.nonFunctionalElements).toHaveLength(1);
      expect(json.issues.patternIssues).toHaveLength(1);
      
      // Check recommendations
      expect(json.recommendations.length).toBeGreaterThan(0);
    });
  });
});
