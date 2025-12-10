/**
 * HTMLParser tests
 * 
 * Tests for the HTML parsing functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { HTMLParser } from '../src/parsers/HTMLParser.js';

// Test HTML content
const testHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
</head>
<body>
  <div id="container">
    <button id="submitBtn" onclick="handleSubmit()">Submit</button>
    <input id="nameInput" type="text" oninput="validateName()" />
    <select id="dropdown" onchange="handleChange()">
      <option>Option 1</option>
    </select>
    <textarea id="comments"></textarea>
    <a href="#" id="link1">Link</a>
  </div>
  <div id="modal">
    <button onclick="closeModal()">Close</button>
  </div>
  <button>No ID Button</button>
</body>
</html>`;

const testFilePath = resolve('audit-tool/tests/fixtures/test.html');

describe('HTMLParser', () => {
  beforeAll(() => {
    // Create fixtures directory if it doesn't exist
    const fixturesDir = resolve('audit-tool/tests/fixtures');
    if (!existsSync(fixturesDir)) {
      mkdirSync(fixturesDir, { recursive: true });
    }
    
    // Write test HTML file
    writeFileSync(testFilePath, testHTML, 'utf-8');
  });

  afterAll(() => {
    // Clean up test file
    try {
      unlinkSync(testFilePath);
    } catch (err) {
      // Ignore errors
    }
  });

  describe('Constructor', () => {
    it('should create an HTMLParser instance', () => {
      const parser = new HTMLParser(testFilePath);
      expect(parser).toBeDefined();
      expect(parser.htmlFilePath).toBe(testFilePath);
    });
  });

  describe('parse()', () => {
    it('should parse HTML file and return HTMLData', () => {
      const parser = new HTMLParser(testFilePath);
      const data = parser.parse();
      
      expect(data).toBeDefined();
      expect(data.elementIds).toBeInstanceOf(Set);
      expect(data.eventHandlers).toBeInstanceOf(Array);
      expect(data.interactiveElements).toBeInstanceOf(Array);
    });
  });

  describe('getElementIds()', () => {
    it('should extract all element IDs', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const ids = parser.getElementIds();
      
      expect(ids).toBeInstanceOf(Set);
      expect(ids.size).toBeGreaterThan(0);
      expect(ids.has('container')).toBe(true);
      expect(ids.has('submitBtn')).toBe(true);
      expect(ids.has('nameInput')).toBe(true);
      expect(ids.has('dropdown')).toBe(true);
      expect(ids.has('comments')).toBe(true);
      expect(ids.has('modal')).toBe(true);
      expect(ids.has('link1')).toBe(true);
    });

    it('should return Set for O(1) lookup', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const ids = parser.getElementIds();
      
      // Verify it's a Set (O(1) lookup)
      expect(ids).toBeInstanceOf(Set);
      
      // Test O(1) lookup
      const hasContainer = ids.has('container');
      expect(hasContainer).toBe(true);
    });
  });

  describe('getEventHandlers()', () => {
    it('should extract all event handlers', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      expect(handlers).toBeInstanceOf(Array);
      expect(handlers.length).toBeGreaterThan(0);
    });

    it('should extract onclick handlers', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      const onclickHandlers = handlers.filter(h => h.eventType === 'onclick');
      expect(onclickHandlers.length).toBeGreaterThanOrEqual(2);
      
      const submitHandler = onclickHandlers.find(h => h.elementId === 'submitBtn');
      expect(submitHandler).toBeDefined();
      expect(submitHandler.functionCall).toBe('handleSubmit()');
    });

    it('should extract oninput handlers', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      const oninputHandlers = handlers.filter(h => h.eventType === 'oninput');
      expect(oninputHandlers.length).toBeGreaterThanOrEqual(1);
      
      const inputHandler = oninputHandlers.find(h => h.elementId === 'nameInput');
      expect(inputHandler).toBeDefined();
      expect(inputHandler.functionCall).toBe('validateName()');
    });

    it('should extract onchange handlers', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      const onchangeHandlers = handlers.filter(h => h.eventType === 'onchange');
      expect(onchangeHandlers.length).toBeGreaterThanOrEqual(1);
      
      const changeHandler = onchangeHandlers.find(h => h.elementId === 'dropdown');
      expect(changeHandler).toBeDefined();
      expect(changeHandler.functionCall).toBe('handleChange()');
    });

    it('should record line numbers', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      handlers.forEach(handler => {
        expect(handler.lineNumber).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getInteractiveElements()', () => {
    it('should identify all interactive elements', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const elements = parser.getInteractiveElements();
      
      expect(elements).toBeInstanceOf(Array);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should identify buttons', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const elements = parser.getInteractiveElements();
      
      const buttons = elements.filter(e => e.tagName === 'button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should identify inputs', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const elements = parser.getInteractiveElements();
      
      const inputs = elements.filter(e => e.tagName === 'input');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('should identify selects', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const elements = parser.getInteractiveElements();
      
      const selects = elements.filter(e => e.tagName === 'select');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('should identify textareas', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const elements = parser.getInteractiveElements();
      
      const textareas = elements.filter(e => e.tagName === 'textarea');
      expect(textareas.length).toBeGreaterThanOrEqual(1);
    });

    it('should check for event handlers', () => {
      const parser = new HTMLParser(testFilePath);
      parser.parse();
      const elements = parser.getInteractiveElements();
      
      const submitBtn = elements.find(e => e.elementId === 'submitBtn');
      expect(submitBtn).toBeDefined();
      expect(submitBtn.hasEventHandler).toBe(true);
      
      const comments = elements.find(e => e.elementId === 'comments');
      expect(comments).toBeDefined();
      expect(comments.hasEventHandler).toBe(false);
    });
  });

  describe('Various HTML Structures', () => {
    it('should handle nested elements with IDs', () => {
      const nestedHTML = `
        <div id="outer">
          <div id="middle">
            <div id="inner">
              <button id="deepBtn">Click</button>
            </div>
          </div>
        </div>
      `;
      const nestedPath = resolve('audit-tool/tests/fixtures/nested.html');
      writeFileSync(nestedPath, nestedHTML, 'utf-8');
      
      const parser = new HTMLParser(nestedPath);
      parser.parse();
      const ids = parser.getElementIds();
      
      expect(ids.has('outer')).toBe(true);
      expect(ids.has('middle')).toBe(true);
      expect(ids.has('inner')).toBe(true);
      expect(ids.has('deepBtn')).toBe(true);
      
      unlinkSync(nestedPath);
    });

    it('should handle elements with duplicate IDs', () => {
      const duplicateHTML = `
        <div id="duplicate">First</div>
        <div id="duplicate">Second</div>
        <div id="unique">Unique</div>
      `;
      const duplicatePath = resolve('audit-tool/tests/fixtures/duplicate.html');
      writeFileSync(duplicatePath, duplicateHTML, 'utf-8');
      
      const parser = new HTMLParser(duplicatePath);
      parser.parse();
      const ids = parser.getElementIds();
      
      // Should still capture the ID (even if invalid HTML)
      expect(ids.has('duplicate')).toBe(true);
      expect(ids.has('unique')).toBe(true);
      
      unlinkSync(duplicatePath);
    });

    it('should handle empty HTML document', () => {
      const emptyHTML = `<!DOCTYPE html><html><head></head><body></body></html>`;
      const emptyPath = resolve('audit-tool/tests/fixtures/empty.html');
      writeFileSync(emptyPath, emptyHTML, 'utf-8');
      
      const parser = new HTMLParser(emptyPath);
      const data = parser.parse();
      
      expect(data.elementIds.size).toBe(0);
      expect(data.eventHandlers.length).toBe(0);
      expect(data.interactiveElements.length).toBe(0);
      
      unlinkSync(emptyPath);
    });

    it('should handle HTML with only text content', () => {
      const textOnlyHTML = `<html><body>Just plain text, no elements with IDs</body></html>`;
      const textPath = resolve('audit-tool/tests/fixtures/text-only.html');
      writeFileSync(textPath, textOnlyHTML, 'utf-8');
      
      const parser = new HTMLParser(textPath);
      const data = parser.parse();
      
      expect(data.elementIds.size).toBe(0);
      expect(data.eventHandlers.length).toBe(0);
      
      unlinkSync(textPath);
    });

    it('should handle elements with whitespace in IDs', () => {
      const whitespaceHTML = `
        <div id="  spacedId  ">Content</div>
        <button id="normalId">Button</button>
      `;
      const whitespacePath = resolve('audit-tool/tests/fixtures/whitespace.html');
      writeFileSync(whitespacePath, whitespaceHTML, 'utf-8');
      
      const parser = new HTMLParser(whitespacePath);
      parser.parse();
      const ids = parser.getElementIds();
      
      // Should trim whitespace
      expect(ids.has('spacedId')).toBe(true);
      expect(ids.has('normalId')).toBe(true);
      
      unlinkSync(whitespacePath);
    });
  });

  describe('Different Event Types', () => {
    it('should extract onsubmit handlers', () => {
      const formHTML = `
        <form id="myForm" onsubmit="handleFormSubmit()">
          <input type="text" />
        </form>
      `;
      const formPath = resolve('audit-tool/tests/fixtures/form.html');
      writeFileSync(formPath, formHTML, 'utf-8');
      
      const parser = new HTMLParser(formPath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      const submitHandler = handlers.find(h => h.eventType === 'onsubmit');
      expect(submitHandler).toBeDefined();
      expect(submitHandler.functionCall).toBe('handleFormSubmit()');
      
      unlinkSync(formPath);
    });

    it('should extract keyboard event handlers', () => {
      const keyboardHTML = `
        <input id="keyInput" onkeydown="handleKeyDown()" onkeyup="handleKeyUp()" />
      `;
      const keyboardPath = resolve('audit-tool/tests/fixtures/keyboard.html');
      writeFileSync(keyboardPath, keyboardHTML, 'utf-8');
      
      const parser = new HTMLParser(keyboardPath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      const keydownHandler = handlers.find(h => h.eventType === 'onkeydown');
      const keyupHandler = handlers.find(h => h.eventType === 'onkeyup');
      
      expect(keydownHandler).toBeDefined();
      expect(keydownHandler.functionCall).toBe('handleKeyDown()');
      expect(keyupHandler).toBeDefined();
      expect(keyupHandler.functionCall).toBe('handleKeyUp()');
      
      unlinkSync(keyboardPath);
    });

    it('should extract mouse event handlers', () => {
      const mouseHTML = `
        <div id="mouseDiv" onmouseover="handleMouseOver()" onmouseout="handleMouseOut()">Hover me</div>
      `;
      const mousePath = resolve('audit-tool/tests/fixtures/mouse.html');
      writeFileSync(mousePath, mouseHTML, 'utf-8');
      
      const parser = new HTMLParser(mousePath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      const mouseoverHandler = handlers.find(h => h.eventType === 'onmouseover');
      const mouseoutHandler = handlers.find(h => h.eventType === 'onmouseout');
      
      expect(mouseoverHandler).toBeDefined();
      expect(mouseoutHandler).toBeDefined();
      
      unlinkSync(mousePath);
    });

    it('should handle complex function calls in event handlers', () => {
      const complexHTML = `
        <button onclick="handleClick(event, 'param1', 123)">Click</button>
        <input oninput="this.value = this.value.toUpperCase()" />
      `;
      const complexPath = resolve('audit-tool/tests/fixtures/complex.html');
      writeFileSync(complexPath, complexHTML, 'utf-8');
      
      const parser = new HTMLParser(complexPath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      const clickHandler = handlers.find(h => h.functionCall.includes('handleClick'));
      expect(clickHandler).toBeDefined();
      expect(clickHandler.functionCall).toContain('event');
      expect(clickHandler.functionCall).toContain('param1');
      
      unlinkSync(complexPath);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformedHTML = `
        <div id="unclosed">
          <button id="btn1" onclick="test()">
          <div id="another">
        </div>
      `;
      const malformedPath = resolve('audit-tool/tests/fixtures/malformed.html');
      writeFileSync(malformedPath, malformedHTML, 'utf-8');
      
      const parser = new HTMLParser(malformedPath);
      
      // Should not throw error
      expect(() => parser.parse()).not.toThrow();
      
      const data = parser.parse();
      expect(data).toBeDefined();
      expect(data.elementIds).toBeInstanceOf(Set);
      
      unlinkSync(malformedPath);
    });

    it('should handle HTML with missing closing tags', () => {
      const missingClosingHTML = `
        <html>
        <body>
          <div id="div1">
            <p id="para1">Text
            <span id="span1">More text
          </div>
        </body>
      `;
      const missingPath = resolve('audit-tool/tests/fixtures/missing-closing.html');
      writeFileSync(missingPath, missingClosingHTML, 'utf-8');
      
      const parser = new HTMLParser(missingPath);
      const data = parser.parse();
      
      expect(data.elementIds.has('div1')).toBe(true);
      expect(data.elementIds.has('para1')).toBe(true);
      expect(data.elementIds.has('span1')).toBe(true);
      
      unlinkSync(missingPath);
    });

    it('should handle HTML with invalid attributes', () => {
      const invalidAttrHTML = `
        <div id="valid" invalid-attr="value" onclick="test()">
          <button id="btn" onclick=>Click</button>
        </div>
      `;
      const invalidPath = resolve('audit-tool/tests/fixtures/invalid-attr.html');
      writeFileSync(invalidPath, invalidAttrHTML, 'utf-8');
      
      const parser = new HTMLParser(invalidPath);
      const data = parser.parse();
      
      expect(data.elementIds.has('valid')).toBe(true);
      expect(data.elementIds.has('btn')).toBe(true);
      
      unlinkSync(invalidPath);
    });

    it('should throw error when calling methods before parse()', () => {
      const parser = new HTMLParser(testFilePath);
      
      expect(() => parser.getElementIds()).toThrow('Parser not initialized');
      expect(() => parser.getEventHandlers()).toThrow('Parser not initialized');
      expect(() => parser.getInteractiveElements()).toThrow('Parser not initialized');
    });

    it('should handle non-existent file path', () => {
      const nonExistentPath = resolve('audit-tool/tests/fixtures/does-not-exist.html');
      const parser = new HTMLParser(nonExistentPath);
      
      expect(() => parser.parse()).toThrow();
    });

    it('should handle empty event handler attributes', () => {
      const emptyHandlerHTML = `
        <button id="btn1" onclick="">Empty</button>
        <button id="btn2" onclick="  ">Whitespace</button>
        <button id="btn3" onclick="valid()">Valid</button>
      `;
      const emptyHandlerPath = resolve('audit-tool/tests/fixtures/empty-handler.html');
      writeFileSync(emptyHandlerPath, emptyHandlerHTML, 'utf-8');
      
      const parser = new HTMLParser(emptyHandlerPath);
      parser.parse();
      const handlers = parser.getEventHandlers();
      
      // Should only capture non-empty handlers
      const validHandlers = handlers.filter(h => h.functionCall && h.functionCall.trim());
      expect(validHandlers.length).toBeGreaterThanOrEqual(1);
      
      const validHandler = handlers.find(h => h.elementId === 'btn3');
      expect(validHandler).toBeDefined();
      
      unlinkSync(emptyHandlerPath);
    });

    it('should handle HTML with special characters in IDs', () => {
      const specialCharsHTML = `
        <div id="id-with-dashes">Content</div>
        <div id="id_with_underscores">Content</div>
        <div id="id123">Content</div>
      `;
      const specialPath = resolve('audit-tool/tests/fixtures/special-chars.html');
      writeFileSync(specialPath, specialCharsHTML, 'utf-8');
      
      const parser = new HTMLParser(specialPath);
      parser.parse();
      const ids = parser.getElementIds();
      
      expect(ids.has('id-with-dashes')).toBe(true);
      expect(ids.has('id_with_underscores')).toBe(true);
      expect(ids.has('id123')).toBe(true);
      
      unlinkSync(specialPath);
    });

    it('should handle very large HTML documents', () => {
      // Create a large HTML document
      let largeHTML = '<html><body>';
      for (let i = 0; i < 1000; i++) {
        largeHTML += `<div id="element${i}"><button onclick="handler${i}()">Button ${i}</button></div>`;
      }
      largeHTML += '</body></html>';
      
      const largePath = resolve('audit-tool/tests/fixtures/large.html');
      writeFileSync(largePath, largeHTML, 'utf-8');
      
      const parser = new HTMLParser(largePath);
      const data = parser.parse();
      
      expect(data.elementIds.size).toBeGreaterThanOrEqual(1000);
      expect(data.eventHandlers.length).toBeGreaterThanOrEqual(1000);
      
      unlinkSync(largePath);
    });
  });
});
