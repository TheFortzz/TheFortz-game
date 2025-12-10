/**
 * Integration tests for Analyzer with real parsers
 */

import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { HTMLParser } from '../src/parsers/HTMLParser.js';
import { JavaScriptParser } from '../src/parsers/JavaScriptParser.js';
import Analyzer from '../src/analyzer/Analyzer.js';

const TEST_DIR = join(process.cwd(), 'tests', 'fixtures', 'analyzer-integration');

describe('Analyzer Integration', () => {
  it('should detect orphaned functions in real code', () => {
    // Setup test files
    mkdirSync(TEST_DIR, { recursive: true });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="existingElement"></div>
        </body>
      </html>
    `;
    
    const jsContent = `
      function testFunction() {
        const elem1 = document.getElementById('existingElement');
        const elem2 = document.getElementById('missingElement');
        return elem1;
      }
    `;
    
    const htmlPath = join(TEST_DIR, 'test.html');
    const jsPath = join(TEST_DIR, 'test.js');
    
    writeFileSync(htmlPath, htmlContent);
    writeFileSync(jsPath, jsContent);
    
    // Parse files
    const htmlParser = new HTMLParser(htmlPath);
    const htmlData = htmlParser.parse();
    
    const jsParser = new JavaScriptParser(TEST_DIR);
    const jsData = jsParser.parse();
    
    // Analyze
    const analyzer = new Analyzer(htmlData, jsData);
    const results = analyzer.analyze();
    
    // Verify
    expect(results.orphanedFunctions).toHaveLength(1);
    expect(results.orphanedFunctions[0].missingElementId).toBe('missingElement');
    
    // Cleanup
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should detect broken event handlers in real code', () => {
    // Setup test files
    mkdirSync(TEST_DIR, { recursive: true });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <button id="btn1" onclick="existingFunction()">Click</button>
          <button id="btn2" onclick="missingFunction()">Click</button>
        </body>
      </html>
    `;
    
    const jsContent = `
      function existingFunction() {
        console.log('exists');
      }
    `;
    
    const htmlPath = join(TEST_DIR, 'test.html');
    const jsPath = join(TEST_DIR, 'test.js');
    
    writeFileSync(htmlPath, htmlContent);
    writeFileSync(jsPath, jsContent);
    
    // Parse files
    const htmlParser = new HTMLParser(htmlPath);
    const htmlData = htmlParser.parse();
    
    const jsParser = new JavaScriptParser(TEST_DIR);
    const jsData = jsParser.parse();
    
    // Analyze
    const analyzer = new Analyzer(htmlData, jsData);
    const results = analyzer.analyze();
    
    // Verify
    expect(results.brokenHandlers).toHaveLength(1);
    expect(results.brokenHandlers[0].missingFunction).toBe('missingFunction');
    
    // Cleanup
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should detect unused functions in real code', () => {
    // Setup test files
    mkdirSync(TEST_DIR, { recursive: true });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <button id="btn1" onclick="usedFunction()">Click</button>
        </body>
      </html>
    `;
    
    const jsContent = `
      function usedFunction() {
        console.log('used');
      }
      
      function unusedFunction() {
        console.log('never called');
      }
      
      function alsoUnused() {
        return 42;
      }
    `;
    
    const htmlPath = join(TEST_DIR, 'test.html');
    const jsPath = join(TEST_DIR, 'test.js');
    
    writeFileSync(htmlPath, htmlContent);
    writeFileSync(jsPath, jsContent);
    
    // Parse files
    const htmlParser = new HTMLParser(htmlPath);
    const htmlData = htmlParser.parse();
    
    const jsParser = new JavaScriptParser(TEST_DIR);
    const jsData = jsParser.parse();
    
    // Analyze
    const analyzer = new Analyzer(htmlData, jsData);
    const results = analyzer.analyze();
    
    // Verify - should find 2 unused functions (unusedFunction and alsoUnused)
    // usedFunction is called by event handler, so it's not unused
    expect(results.unusedFunctions).toHaveLength(2);
    const unusedNames = results.unusedFunctions.map(f => f.functionName);
    expect(unusedNames).toContain('unusedFunction');
    expect(unusedNames).toContain('alsoUnused');
    
    // Cleanup
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should detect non-functional elements in real code', () => {
    // Setup test files
    mkdirSync(TEST_DIR, { recursive: true });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <button id="btn1" onclick="handleClick()">Has Handler</button>
          <button id="btn2">No Handler</button>
          <input id="input1" type="text" />
        </body>
      </html>
    `;
    
    const jsContent = `
      function handleClick() {
        console.log('clicked');
      }
    `;
    
    const htmlPath = join(TEST_DIR, 'test.html');
    const jsPath = join(TEST_DIR, 'test.js');
    
    writeFileSync(htmlPath, htmlContent);
    writeFileSync(jsPath, jsContent);
    
    // Parse files
    const htmlParser = new HTMLParser(htmlPath);
    const htmlData = htmlParser.parse();
    
    const jsParser = new JavaScriptParser(TEST_DIR);
    const jsData = jsParser.parse();
    
    // Analyze
    const analyzer = new Analyzer(htmlData, jsData);
    const results = analyzer.analyze();
    
    // Verify - should find btn2 and input1 as non-functional
    expect(results.nonFunctionalElements).toHaveLength(2);
    const nonFunctionalIds = results.nonFunctionalElements.map(e => e.elementId);
    expect(nonFunctionalIds).toContain('btn2');
    expect(nonFunctionalIds).toContain('input1');
    
    // Cleanup
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should validate UI patterns in real code', () => {
    // Setup test files
    mkdirSync(TEST_DIR, { recursive: true });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="loginModal"></div>
          <div id="settingsTab"></div>
          <form id="contactForm"></form>
          <nav id="mainNav"></nav>
        </body>
      </html>
    `;
    
    const jsContent = `
      // No functions defined - all patterns should have issues
    `;
    
    const htmlPath = join(TEST_DIR, 'test.html');
    const jsPath = join(TEST_DIR, 'test.js');
    
    writeFileSync(htmlPath, htmlContent);
    writeFileSync(jsPath, jsContent);
    
    // Parse files
    const htmlParser = new HTMLParser(htmlPath);
    const htmlData = htmlParser.parse();
    
    const jsParser = new JavaScriptParser(TEST_DIR);
    const jsData = jsParser.parse();
    
    // Analyze
    const analyzer = new Analyzer(htmlData, jsData);
    const results = analyzer.analyze();
    
    // Verify - should find issues for all patterns
    expect(results.patternIssues.length).toBeGreaterThan(0);
    
    const patterns = results.patternIssues.map(i => i.pattern);
    expect(patterns).toContain('modal');
    expect(patterns).toContain('tab');
    expect(patterns).toContain('form');
    expect(patterns).toContain('navigation');
    
    // Cleanup
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should handle complete analysis with multiple issues', () => {
    // Setup test files
    mkdirSync(TEST_DIR, { recursive: true });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="app"></div>
          <button id="submitBtn" onclick="submit()">Submit</button>
          <button id="cancelBtn">Cancel</button>
          <div id="userModal"></div>
        </body>
      </html>
    `;
    
    const jsContent = `
      function init() {
        const app = document.getElementById('app');
        const missing = document.getElementById('nonExistent');
      }
      
      function submit() {
        console.log('submitting');
      }
      
      function neverCalled() {
        return 'unused';
      }
    `;
    
    const htmlPath = join(TEST_DIR, 'test.html');
    const jsPath = join(TEST_DIR, 'test.js');
    
    writeFileSync(htmlPath, htmlContent);
    writeFileSync(jsPath, jsContent);
    
    // Parse files
    const htmlParser = new HTMLParser(htmlPath);
    const htmlData = htmlParser.parse();
    
    const jsParser = new JavaScriptParser(TEST_DIR);
    const jsData = jsParser.parse();
    
    // Analyze
    const analyzer = new Analyzer(htmlData, jsData);
    const results = analyzer.analyze();
    
    // Verify multiple issue types
    expect(results.orphanedFunctions.length).toBeGreaterThan(0); // nonExistent element
    expect(results.unusedFunctions.length).toBeGreaterThan(0); // neverCalled, init
    expect(results.nonFunctionalElements.length).toBeGreaterThan(0); // cancelBtn
    expect(results.patternIssues.length).toBeGreaterThan(0); // userModal
    
    // Cleanup
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
});
