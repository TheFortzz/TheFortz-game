/**
 * Tests for ReportGenerator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import ReportGenerator from '../src/reporter/ReportGenerator.js';

describe('ReportGenerator', () => {
  let sampleResults;

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

  describe('constructor', () => {
    it('should create a ReportGenerator instance', () => {
      const generator = new ReportGenerator(sampleResults);
      expect(generator).toBeDefined();
      expect(generator.results).toBe(sampleResults);
    });
  });

  describe('generateMarkdown', () => {
    it('should generate markdown report', () => {
      const generator = new ReportGenerator(sampleResults);
      const markdown = generator.generateMarkdown();
      
      expect(markdown).toContain('# JavaScript-HTML Connection Audit Report');
      expect(markdown).toContain('## Executive Summary');
      expect(markdown).toContain('Total Issues');
    });

    it('should include all issue sections', () => {
      const generator = new ReportGenerator(sampleResults);
      const markdown = generator.generateMarkdown();
      
      expect(markdown).toContain('Orphaned Functions');
      expect(markdown).toContain('Broken Event Handlers');
      expect(markdown).toContain('Unused Functions');
      expect(markdown).toContain('Non-Functional Interactive Elements');
      expect(markdown).toContain('UI Pattern Issues');
      expect(markdown).toContain('Recommendations');
    });

    it('should include specific issue details', () => {
      const generator = new ReportGenerator(sampleResults);
      const markdown = generator.generateMarkdown();
      
      expect(markdown).toContain('handleClick');
      expect(markdown).toContain('submitBtn');
      expect(markdown).toContain('doLogin');
      expect(markdown).toContain('oldHelper');
      expect(markdown).toContain('saveBtn');
      expect(markdown).toContain('loginModal');
    });

    it('should show success message when no issues', () => {
      const emptyResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };
      
      const generator = new ReportGenerator(emptyResults);
      const markdown = generator.generateMarkdown();
      
      expect(markdown).toContain('No issues found');
    });
  });

  describe('generateJSON', () => {
    it('should generate JSON report', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json).toBeDefined();
      expect(json.metadata).toBeDefined();
      expect(json.summary).toBeDefined();
      expect(json.issues).toBeDefined();
      expect(json.recommendations).toBeDefined();
    });

    it('should include correct summary counts', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json.summary.totalIssues).toBe(5);
      expect(json.summary.critical).toBe(1);
      expect(json.summary.warning).toBe(3); // orphaned + nonFunctional + pattern(warning)
      expect(json.summary.info).toBe(1);
    });

    it('should include all issues with severity', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json.issues.orphanedFunctions).toHaveLength(1);
      expect(json.issues.orphanedFunctions[0].severity).toBe('warning');
      
      expect(json.issues.brokenHandlers).toHaveLength(1);
      expect(json.issues.brokenHandlers[0].severity).toBe('critical');
      
      expect(json.issues.unusedFunctions).toHaveLength(1);
      expect(json.issues.unusedFunctions[0].severity).toBe('info');
    });

    it('should include recommendations', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json.recommendations).toBeInstanceOf(Array);
      expect(json.recommendations.length).toBeGreaterThan(0);
      expect(json.recommendations[0]).toHaveProperty('priority');
      expect(json.recommendations[0]).toHaveProperty('title');
      expect(json.recommendations[0]).toHaveProperty('description');
    });
  });

  describe('severity classification', () => {
    it('should classify broken handlers as critical', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json.issues.brokenHandlers[0].severity).toBe('critical');
    });

    it('should classify orphaned functions as warning', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json.issues.orphanedFunctions[0].severity).toBe('warning');
    });

    it('should classify unused functions as info', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json.issues.unusedFunctions[0].severity).toBe('info');
    });

    it('should respect pattern issue severity', () => {
      const generator = new ReportGenerator(sampleResults);
      const json = generator.generateJSON();
      
      expect(json.issues.patternIssues[0].severity).toBe('warning');
    });
  });

  describe('_countIssues', () => {
    it('should count issues correctly', () => {
      const generator = new ReportGenerator(sampleResults);
      const counts = generator._countIssues();
      
      expect(counts.critical).toBe(1);
      expect(counts.warning).toBe(3); // orphaned + nonFunctional + pattern(warning)
      expect(counts.info).toBe(1);
      expect(counts.total).toBe(5);
    });

    it('should handle empty results', () => {
      const emptyResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };
      
      const generator = new ReportGenerator(emptyResults);
      const counts = generator._countIssues();
      
      expect(counts.critical).toBe(0);
      expect(counts.warning).toBe(0);
      expect(counts.info).toBe(0);
      expect(counts.total).toBe(0);
    });
  });

  describe('printSummary', () => {
    it('should print summary without errors', () => {
      const generator = new ReportGenerator(sampleResults);
      
      // Should not throw
      expect(() => generator.printSummary()).not.toThrow();
    });

    it('should handle empty results', () => {
      const emptyResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };
      
      const generator = new ReportGenerator(emptyResults);
      
      // Should not throw
      expect(() => generator.printSummary()).not.toThrow();
    });
  });
});
