/**
 * Unit tests for AutoFixer class
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import AutoFixer from '../src/fixer/AutoFixer.js';

describe('AutoFixer', () => {
  const testDir = resolve('audit-tool/tests/fixtures/autofixer');
  const backupDir = resolve('audit-tool/tests/fixtures/autofixer/.test-backups');

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should create an AutoFixer instance with analysis results', () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults);

      expect(fixer).toBeDefined();
      expect(fixer.analysisResults).toBe(analysisResults);
      expect(fixer.backupDir).toBe('.audit-backups');
    });

    it('should accept custom backup directory', () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir: '/custom/backup' });

      expect(fixer.backupDir).toBe('/custom/backup');
    });
  });

  describe('getSafeFixes', () => {
    it('should identify removable unused functions', () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unusedFunc1',
            filePath: 'test.js',
            lineNumber: 10,
            callCount: 0
          },
          {
            functionName: 'unusedFunc2',
            filePath: 'test.js',
            lineNumber: 20,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults);
      const fixes = fixer.getSafeFixes();

      expect(fixes).toHaveLength(2);
      expect(fixes[0].type).toBe('remove-function');
      expect(fixes[0].safe).toBe(true);
      expect(fixes[0].metadata.functionName).toBe('unusedFunc1');
      expect(fixes[1].metadata.functionName).toBe('unusedFunc2');
    });

    it('should identify removable broken event handlers', () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [
          {
            elementId: 'button1',
            eventType: 'onclick',
            missingFunction: 'handleClick',
            htmlLineNumber: 15
          },
          {
            elementId: null,
            eventType: 'oninput',
            missingFunction: 'handleInput',
            htmlLineNumber: 20
          }
        ],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults);
      const fixes = fixer.getSafeFixes();

      expect(fixes).toHaveLength(2);
      
      const safeFix = fixes.find(f => f.metadata.elementId === 'button1');
      expect(safeFix.type).toBe('remove-handler');
      expect(safeFix.safe).toBe(true);
      
      const unsafeFix = fixes.find(f => f.metadata.elementId === null);
      expect(unsafeFix.safe).toBe(false);
    });

    it('should return empty array when no issues found', () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults);
      const fixes = fixer.getSafeFixes();

      expect(fixes).toHaveLength(0);
    });

    it('should include descriptions for all fixes', () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'testFunc',
            filePath: 'test.js',
            lineNumber: 5,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults);
      const fixes = fixer.getSafeFixes();

      expect(fixes[0].description).toBeDefined();
      expect(fixes[0].description).toContain('testFunc');
    });
  });

  describe('createBackup', () => {
    it('should create backup of a file', async () => {
      const testFile = resolve(testDir, 'test.js');
      const testContent = 'function test() { return 42; }';
      writeFileSync(testFile, testContent, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const backupPath = await fixer.createBackup(testFile);

      expect(existsSync(backupPath)).toBe(true);
      const backupContent = readFileSync(backupPath, 'utf-8');
      expect(backupContent).toBe(testContent);
    });

    it('should create backup directory if it does not exist', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'content', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      await fixer.createBackup(testFile);

      expect(existsSync(backupDir)).toBe(true);
    });

    it('should not create duplicate backups for same file', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'content', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const backupPath1 = await fixer.createBackup(testFile);
      const backupPath2 = await fixer.createBackup(testFile);

      expect(backupPath1).toBe(backupPath2);
      expect(fixer.backups.size).toBe(1);
    });

    it('should track backup locations', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'content', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const backupPath = await fixer.createBackup(testFile);

      expect(fixer.backups.has(testFile)).toBe(true);
      expect(fixer.backups.get(testFile)).toBe(backupPath);
    });
  });

  describe('applyFixes', () => {
    it('should apply fixes to JavaScript files', async () => {
      const testFile = resolve(testDir, 'test.js');
      const testContent = `
function usedFunction() {
  return 'used';
}

function unusedFunction() {
  return 'unused';
}

function anotherUsedFunction() {
  return usedFunction();
}
`;
      writeFileSync(testFile, testContent, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unusedFunction',
            filePath: testFile,
            lineNumber: 5,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      const results = await fixer.applyFixes(fixes);

      expect(results.applied).toHaveLength(1);
      expect(results.failed).toHaveLength(0);

      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).not.toContain('unusedFunction');
      expect(modifiedContent).toContain('usedFunction');
      expect(modifiedContent).toContain('anotherUsedFunction');
    });

    it('should apply fixes to HTML files', async () => {
      const testFile = resolve(testDir, 'test.html');
      const testContent = `
<!DOCTYPE html>
<html>
<body>
  <button id="btn1" onclick="handleClick()">Click</button>
  <button id="btn2" onclick="missingFunction()">Broken</button>
  <input id="input1" oninput="handleInput()" />
</body>
</html>
`;
      writeFileSync(testFile, testContent, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [
          {
            elementId: 'btn2',
            eventType: 'onclick',
            missingFunction: 'missingFunction',
            htmlLineNumber: 6,
            htmlFilePath: testFile  // Add the actual HTML file path
          }
        ],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir, htmlFilePath: testFile });
      const fixes = fixer.getSafeFixes();
      
      // Update the fix to use the actual HTML file path
      fixes.forEach(fix => {
        if (fix.filePath === 'html') {
          fix.filePath = testFile;
        }
      });
      
      const results = await fixer.applyFixes(fixes);

      expect(results.applied).toHaveLength(1);
      expect(results.failed).toHaveLength(0);

      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).not.toContain('onclick="missingFunction()"');
      expect(modifiedContent).toContain('onclick="handleClick()"');
      expect(modifiedContent).toContain('oninput="handleInput()"');
    });

    it('should create backups before applying fixes', async () => {
      const testFile = resolve(testDir, 'test.js');
      const originalContent = 'function unused() {}';
      writeFileSync(testFile, originalContent, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      expect(fixer.backups.size).toBe(1);
      const backupPath = fixer.backups.get(testFile);
      expect(existsSync(backupPath)).toBe(true);
      
      const backupContent = readFileSync(backupPath, 'utf-8');
      expect(backupContent).toBe(originalContent);
    });

    it('should handle multiple fixes to same file', async () => {
      const testFile = resolve(testDir, 'test.js');
      const testContent = `
function unused1() {}
function unused2() {}
function used() { return 42; }
`;
      writeFileSync(testFile, testContent, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused1',
            filePath: testFile,
            lineNumber: 2,
            callCount: 0
          },
          {
            functionName: 'unused2',
            filePath: testFile,
            lineNumber: 3,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      const results = await fixer.applyFixes(fixes);

      expect(results.applied).toHaveLength(2);
      
      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).not.toContain('unused1');
      expect(modifiedContent).not.toContain('unused2');
      expect(modifiedContent).toContain('used');
    });

    it('should log all changes made', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'function unused() {}', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      const results = await fixer.applyFixes(fixes);

      expect(results.applied).toHaveLength(1);
      expect(results.applied[0].type).toBe('remove-function');
      expect(results.applied[0].description).toContain('unused');
    });

    it('should handle errors gracefully', async () => {
      const nonExistentFile = resolve(testDir, 'nonexistent.js');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused',
            filePath: nonExistentFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      const results = await fixer.applyFixes(fixes);

      expect(results.applied).toHaveLength(0);
      expect(results.failed).toHaveLength(1);
      expect(results.failed[0].error).toBeDefined();
    });

    it('should return backup paths in results', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'function unused() {}', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      const results = await fixer.applyFixes(fixes);

      expect(results.backupPaths).toHaveLength(1);
      expect(existsSync(results.backupPaths[0])).toBe(true);
    });

    it('should handle arrow functions', async () => {
      const testFile = resolve(testDir, 'test.js');
      const testContent = `
const usedFunc = () => 'used';
const unusedFunc = () => 'unused';
export { usedFunc };
`;
      writeFileSync(testFile, testContent, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unusedFunc',
            filePath: testFile,
            lineNumber: 3,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      const results = await fixer.applyFixes(fixes);

      expect(results.applied).toHaveLength(1);
      
      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).not.toContain('unusedFunc');
      expect(modifiedContent).toContain('usedFunc');
    });
  });

  describe('rollback', () => {
    it('should restore files from backups', async () => {
      const testFile = resolve(testDir, 'test.js');
      const originalContent = 'function original() { return "original"; }';
      writeFileSync(testFile, originalContent, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'original',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      // Verify file was modified
      let modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).not.toContain('original');

      // Rollback
      await fixer.rollback();

      // Verify file was restored
      const restoredContent = readFileSync(testFile, 'utf-8');
      expect(restoredContent).toBe(originalContent);
    });

    it('should clean up backup directory', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'function test() {}', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'test',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      expect(existsSync(backupDir)).toBe(true);

      await fixer.rollback();

      expect(existsSync(backupDir)).toBe(false);
    });

    it('should clear backup tracking', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'function test() {}', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'test',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      expect(fixer.backups.size).toBe(1);

      await fixer.rollback();

      expect(fixer.backups.size).toBe(0);
    });

    it('should handle multiple file rollbacks', async () => {
      const testFile1 = resolve(testDir, 'test1.js');
      const testFile2 = resolve(testDir, 'test2.js');
      const content1 = 'function test1() {}';
      const content2 = 'function test2() {}';
      writeFileSync(testFile1, content1, 'utf-8');
      writeFileSync(testFile2, content2, 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'test1',
            filePath: testFile1,
            lineNumber: 1,
            callCount: 0
          },
          {
            functionName: 'test2',
            filePath: testFile2,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      await fixer.rollback();

      const restored1 = readFileSync(testFile1, 'utf-8');
      const restored2 = readFileSync(testFile2, 'utf-8');
      expect(restored1).toBe(content1);
      expect(restored2).toBe(content2);
    });

    it('should handle rollback errors gracefully', async () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      
      // Add a fake backup entry
      fixer.backups.set('/nonexistent/file.js', '/nonexistent/backup.js');

      // Should not throw
      await expect(fixer.rollback()).resolves.not.toThrow();
    });
  });

  describe('generateFixSummary', () => {
    it('should generate summary with statistics', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'function unused() {}', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      const summary = fixer.generateFixSummary();

      expect(summary.totalFixes).toBe(1);
      expect(summary.appliedCount).toBe(1);
      expect(summary.failedCount).toBe(0);
      expect(summary.backupCount).toBe(1);
    });

    it('should list all applied fixes', async () => {
      const testFile = resolve(testDir, 'test.js');
      writeFileSync(testFile, 'function unused1() {}\nfunction unused2() {}', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused1',
            filePath: testFile,
            lineNumber: 1,
            callCount: 0
          },
          {
            functionName: 'unused2',
            filePath: testFile,
            lineNumber: 2,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      const summary = fixer.generateFixSummary();

      expect(summary.applied).toHaveLength(2);
      expect(summary.applied[0].type).toBe('remove-function');
      expect(summary.applied[0].description).toBeDefined();
      expect(summary.applied[0].filePath).toBe(testFile);
    });

    it('should list all failed fixes', async () => {
      const nonExistentFile = resolve(testDir, 'nonexistent.js');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused',
            filePath: nonExistentFile,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      const summary = fixer.generateFixSummary();

      expect(summary.failed).toHaveLength(1);
      expect(summary.failed[0].error).toBeDefined();
      expect(summary.failed[0].type).toBe('remove-function');
    });

    it('should list all backup locations', async () => {
      const testFile1 = resolve(testDir, 'test1.js');
      const testFile2 = resolve(testDir, 'test2.js');
      writeFileSync(testFile1, 'function unused1() {}', 'utf-8');
      writeFileSync(testFile2, 'function unused2() {}', 'utf-8');

      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [
          {
            functionName: 'unused1',
            filePath: testFile1,
            lineNumber: 1,
            callCount: 0
          },
          {
            functionName: 'unused2',
            filePath: testFile2,
            lineNumber: 1,
            callCount: 0
          }
        ],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const fixes = fixer.getSafeFixes();
      await fixer.applyFixes(fixes);

      const summary = fixer.generateFixSummary();

      expect(summary.backups).toHaveLength(2);
      expect(summary.backups[0].original).toBeDefined();
      expect(summary.backups[0].backup).toBeDefined();
    });

    it('should handle empty results', () => {
      const analysisResults = {
        orphanedFunctions: [],
        brokenHandlers: [],
        unusedFunctions: [],
        nonFunctionalElements: [],
        patternIssues: []
      };

      const fixer = new AutoFixer(analysisResults, { backupDir });
      const summary = fixer.generateFixSummary();

      expect(summary.totalFixes).toBe(0);
      expect(summary.appliedCount).toBe(0);
      expect(summary.failedCount).toBe(0);
      expect(summary.backupCount).toBe(0);
      expect(summary.applied).toHaveLength(0);
      expect(summary.failed).toHaveLength(0);
      expect(summary.backups).toHaveLength(0);
    });
  });
});
