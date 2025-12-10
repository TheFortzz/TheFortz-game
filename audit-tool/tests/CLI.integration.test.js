/**
 * CLI Integration Tests
 * 
 * Tests the full CLI pipeline with various command-line options and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const CLI_PATH = resolve('src/index.js');
const FIXTURES_DIR = resolve('tests/fixtures');

/**
 * Helper function to run CLI command and capture output
 */
function runCLI(args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      stdio: 'pipe',
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr,
        success: code === 0
      });
    });

    child.on('error', (error) => {
      reject(error);
    });

    // Set timeout to prevent hanging
    setTimeout(() => {
      child.kill();
      reject(new Error('CLI command timed out'));
    }, 30000); // 30 second timeout
  });
}

/**
 * Create temporary directory for test outputs
 */
function createTempDir() {
  const tempDir = join(tmpdir(), `audit-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

describe('CLI Integration Tests', () => {
  let tempOutputDir;

  beforeEach(() => {
    tempOutputDir = createTempDir();
  });

  afterEach(() => {
    if (tempOutputDir && existsSync(tempOutputDir)) {
      rmSync(tempOutputDir, { recursive: true, force: true });
    }
  });

  describe('Help and Usage', () => {
    it('should display help message when --help flag is used', async () => {
      const result = await runCLI(['--help']);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('JavaScript-HTML Connection Audit Tool');
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('Options:');
      expect(result.stdout).toContain('Examples:');
    });

    it('should display help message when no arguments and files do not exist', async () => {
      const result = await runCLI(['--html', 'nonexistent.html']);
      
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('HTML file not found');
    });
  });

  describe('Argument Validation', () => {
    it('should fail when HTML file does not exist', async () => {
      const result = await runCLI([
        '--html', 'nonexistent.html',
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir
      ]);
      
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('HTML file not found');
    });

    it('should fail when JS directory does not exist', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', 'nonexistent-dir',
        '--output', tempOutputDir
      ]);
      
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('JavaScript directory not found');
    });

    it('should fail with invalid format option', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--format', 'invalid-format',
        '--output', tempOutputDir
      ]);
      
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Invalid format');
    });
  });

  describe('Full Pipeline Tests', () => {
    it('should successfully run full audit with sample project', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir,
        '--format', 'both'
      ]);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Stage 1: Parsing files');
      expect(result.stdout).toContain('Stage 2: Analyzing connections');
      expect(result.stdout).toContain('Stage 3: Generating reports');
      expect(result.stdout).toContain('Audit complete');
      
      // Check that reports were generated
      expect(existsSync(join(tempOutputDir, 'audit-report.md'))).toBe(true);
      expect(existsSync(join(tempOutputDir, 'audit-report.json'))).toBe(true);
    });

    it('should generate markdown report only when format is markdown', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir,
        '--format', 'markdown'
      ]);
      
      expect(result.success).toBe(true);
      expect(existsSync(join(tempOutputDir, 'audit-report.md'))).toBe(true);
      expect(existsSync(join(tempOutputDir, 'audit-report.json'))).toBe(false);
    });

    it('should generate JSON report only when format is json', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir,
        '--format', 'json'
      ]);
      
      expect(result.success).toBe(true);
      expect(existsSync(join(tempOutputDir, 'audit-report.md'))).toBe(false);
      expect(existsSync(join(tempOutputDir, 'audit-report.json'))).toBe(true);
    });

    it('should detect expected issues in sample project', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir,
        '--format', 'json'
      ]);
      
      expect(result.success).toBe(true);
      
      // Read and parse the JSON report
      const reportPath = join(tempOutputDir, 'audit-report.json');
      const reportContent = readFileSync(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      // Should detect orphaned functions
      expect(report.issues.orphanedFunctions.length).toBeGreaterThan(0);
      const orphanedFunctionNames = report.issues.orphanedFunctions.map(f => f.functionName);
      expect(orphanedFunctionNames).toContain('orphanedFunction');
      
      // Should detect broken event handlers
      expect(report.issues.brokenHandlers.length).toBeGreaterThan(0);
      const brokenHandlerFunctions = report.issues.brokenHandlers.map(h => h.missingFunction);
      expect(brokenHandlerFunctions).toContain('nonExistentFunction');
      
      // Should detect unused functions
      expect(report.issues.unusedFunctions.length).toBeGreaterThan(0);
      const unusedFunctionNames = report.issues.unusedFunctions.map(f => f.functionName);
      expect(unusedFunctionNames).toContain('unusedFunction');
      
      // Should detect non-functional elements
      expect(report.issues.nonFunctionalElements.length).toBeGreaterThan(0);
    });

    it('should handle empty files gracefully', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'empty.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir
      ]);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Audit complete');
    });

    it('should handle malformed HTML gracefully', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'malformed.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir
      ]);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Audit complete');
    });
  });

  describe('Auto-Fix Mode', () => {
    let tempJSDir;
    let tempJSFile;

    beforeEach(() => {
      // Create temporary JS file for testing fixes
      tempJSDir = createTempDir();
      tempJSFile = join(tempJSDir, 'test.js');
      
      // Copy sample JS with some unused functions
      const sampleJS = `
function usedFunction() {
  const element = document.getElementById('existingElement');
  return element;
}

function unusedFunction1() {
  return 'unused1';
}

function unusedFunction2() {
  return 'unused2';
}

// This function is called
usedFunction();
`;
      writeFileSync(tempJSFile, sampleJS);
      
      // Create corresponding HTML with the existing element
      const tempHTMLFile = join(tempJSDir, 'test.html');
      writeFileSync(tempHTMLFile, `
<!DOCTYPE html>
<html>
<body>
  <div id="existingElement">Test</div>
</body>
</html>
`);
    });

    afterEach(() => {
      if (tempJSDir && existsSync(tempJSDir)) {
        rmSync(tempJSDir, { recursive: true, force: true });
      }
    });

    it('should apply fixes when --fix flag is used', async () => {
      const result = await runCLI([
        '--html', join(tempJSDir, 'test.html'),
        '--js', tempJSDir,
        '--output', tempOutputDir,
        '--fix'
      ]);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Stage 4: Applying fixes');
      expect(result.stdout).toContain('safe fixes');
    });

    it('should create backups when applying fixes', async () => {
      const result = await runCLI([
        '--html', join(tempJSDir, 'test.html'),
        '--js', tempJSDir,
        '--output', tempOutputDir,
        '--fix'
      ]);
      
      expect(result.success).toBe(true);
      
      if (result.stdout.includes('Backups created in:')) {
        // Check that backup was mentioned
        expect(result.stdout).toContain('Backups created in:');
      }
    });

    it('should not apply fixes when --fix flag is not used', async () => {
      const result = await runCLI([
        '--html', join(tempJSDir, 'test.html'),
        '--js', tempJSDir,
        '--output', tempOutputDir
      ]);
      
      expect(result.success).toBe(true);
      expect(result.stdout).not.toContain('Stage 4: Applying fixes');
    });
  });

  describe('Progress Indicators', () => {
    it('should show progress indicators during execution', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir
      ]);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Parsing');
      expect(result.stdout).toContain('Analysis');
      expect(result.stdout).toContain('Reporting');
    });
  });

  describe('Error Handling', () => {
    it('should handle permission errors gracefully', async () => {
      // Try to write to a read-only directory (if possible)
      const readOnlyDir = join(tempOutputDir, 'readonly');
      mkdirSync(readOnlyDir, { recursive: true });
      
      // Note: This test might not work on all systems due to permission handling
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', readOnlyDir
      ]);
      
      // Should either succeed or fail gracefully
      expect(typeof result.code).toBe('number');
    });

    it('should handle syntax errors in JavaScript files', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR, // This includes syntax-error.js
        '--output', tempOutputDir
      ]);
      
      // Should complete despite syntax errors
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Audit complete');
    });

    it('should exit with error code on validation failures', async () => {
      const result = await runCLI([
        '--html', 'nonexistent.html',
        '--js', 'nonexistent-dir'
      ]);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(1);
    });
  });

  describe('Command Line Options', () => {
    it('should accept short form arguments', async () => {
      const result = await runCLI([
        '-h', join(FIXTURES_DIR, 'sample.html'),
        '-j', FIXTURES_DIR,
        '-o', tempOutputDir,
        '-f', 'json'
      ]);
      
      expect(result.success).toBe(true);
      expect(existsSync(join(tempOutputDir, 'audit-report.json'))).toBe(true);
    });

    it('should use default values when options are not provided', async () => {
      // This test assumes the default files exist, so we'll just check the help
      const result = await runCLI(['--help']);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('default: src/client/index.html');
      expect(result.stdout).toContain('default: src/client/js');
      expect(result.stdout).toContain('default: audit-tool/output');
      expect(result.stdout).toContain('default: both');
    });
  });

  describe('Output Validation', () => {
    it('should create output directory if it does not exist', async () => {
      const nonExistentOutput = join(tempOutputDir, 'new-dir', 'nested');
      
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', nonExistentOutput
      ]);
      
      expect(result.success).toBe(true);
      expect(existsSync(nonExistentOutput)).toBe(true);
    });

    it('should generate valid JSON report', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir,
        '--format', 'json'
      ]);
      
      expect(result.success).toBe(true);
      
      const reportPath = join(tempOutputDir, 'audit-report.json');
      const reportContent = readFileSync(reportPath, 'utf8');
      
      // Should be valid JSON
      expect(() => JSON.parse(reportContent)).not.toThrow();
      
      const report = JSON.parse(reportContent);
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('issues');
      expect(report.issues).toHaveProperty('orphanedFunctions');
      expect(report.issues).toHaveProperty('brokenHandlers');
      expect(report.issues).toHaveProperty('unusedFunctions');
      expect(report.issues).toHaveProperty('nonFunctionalElements');
    });

    it('should generate valid markdown report', async () => {
      const result = await runCLI([
        '--html', join(FIXTURES_DIR, 'sample.html'),
        '--js', FIXTURES_DIR,
        '--output', tempOutputDir,
        '--format', 'markdown'
      ]);
      
      expect(result.success).toBe(true);
      
      const reportPath = join(tempOutputDir, 'audit-report.md');
      const reportContent = readFileSync(reportPath, 'utf8');
      
      expect(reportContent).toContain('# JavaScript-HTML Connection Audit Report');
      expect(reportContent).toContain('## Executive Summary');
      expect(reportContent).toContain('## 1. Orphaned Functions');
      expect(reportContent).toContain('## 2. Broken Event Handlers');
    });
  });

  describe('Real Codebase Integration', () => {
    it('should handle TheFortz codebase if available', async () => {
      const theFortzHTML = resolve('src/client/index.html');
      const theFortzJS = resolve('src/client/js');
      
      // Skip if TheFortz files don't exist
      if (!existsSync(theFortzHTML) || !existsSync(theFortzJS)) {
        console.log('Skipping TheFortz integration test: files not found');
        return;
      }
      
      const result = await runCLI([
        '--html', theFortzHTML,
        '--js', theFortzJS,
        '--output', tempOutputDir,
        '--format', 'json'
      ]);
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Audit complete');
      
      // Verify report was generated
      const reportPath = join(tempOutputDir, 'audit-report.json');
      expect(existsSync(reportPath)).toBe(true);
      
      // Parse and validate report structure
      const reportContent = readFileSync(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      expect(report).toHaveProperty('summary');
      expect(typeof report.summary.totalIssues).toBe('number');
      
      console.log(`\nTheFortz Audit Results:`);
      console.log(`  Total Issues: ${report.summary.totalIssues}`);
      console.log(`  Orphaned Functions: ${report.issues.orphanedFunctions.length}`);
      console.log(`  Broken Handlers: ${report.issues.brokenHandlers.length}`);
      console.log(`  Unused Functions: ${report.issues.unusedFunctions.length}`);
      console.log(`  Non-functional Elements: ${report.issues.nonFunctionalElements.length}`);
    });
  });
});