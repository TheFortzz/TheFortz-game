/**
 * Tests for JavaScriptParser
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JavaScriptParser } from '../src/parsers/JavaScriptParser.js';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

describe('JavaScriptParser', () => {
  const testDir = join(process.cwd(), 'audit-tool', 'tests', 'fixtures', 'js-test');

  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('Function Definition Extraction', () => {
    it('should extract function declarations', () => {
      const code = `
        function testFunction() {
          console.log('test');
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('testFunction')).toBe(true);
      const func = result.functions.get('testFunction');
      expect(func.name).toBe('testFunction');
      expect(func.lineNumber).toBeGreaterThan(0);
    });

    it('should extract function expressions', () => {
      const code = `
        const myFunc = function() {
          return 42;
        };
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('myFunc')).toBe(true);
    });

    it('should extract arrow functions', () => {
      const code = `
        const arrowFunc = () => {
          return 'arrow';
        };
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('arrowFunc')).toBe(true);
    });

    it('should extract class methods', () => {
      const code = `
        class MyClass {
          myMethod() {
            return 'method';
          }
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('myMethod')).toBe(true);
    });
  });

  describe('DOM Query Extraction', () => {
    it('should extract getElementById calls', () => {
      const code = `
        function init() {
          const elem = document.getElementById('myElement');
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].method).toBe('getElementById');
      expect(result.domQueries[0].selector).toBe('myElement');
      expect(result.domQueries[0].functionContext).toBe('init');
    });

    it('should extract querySelector calls', () => {
      const code = `
        const elem = document.querySelector('.my-class');
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].method).toBe('querySelector');
      expect(result.domQueries[0].selector).toBe('.my-class');
    });

    it('should extract querySelectorAll calls', () => {
      const code = `
        const elems = document.querySelectorAll('div.item');
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].method).toBe('querySelectorAll');
      expect(result.domQueries[0].selector).toBe('div.item');
    });

    it('should mark dynamic selectors', () => {
      const code = `
        const id = 'dynamic';
        const elem = document.getElementById(id);
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].selector).toBe('<dynamic>');
    });
  });

  describe('Function Call Tracking', () => {
    it('should track direct function calls', () => {
      const code = `
        function helper() {}
        function main() {
          helper();
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functionCalls.has('helper')).toBe(true);
      expect(result.functionCalls.get('helper').length).toBe(1);
      expect(result.functionCalls.get('helper')[0].context).toBe('main');
    });

    it('should track method calls', () => {
      const code = `
        const obj = {
          method() {}
        };
        obj.method();
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functionCalls.has('method')).toBe(true);
    });

    it('should track multiple calls to same function', () => {
      const code = `
        function util() {}
        util();
        util();
        util();
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functionCalls.has('util')).toBe(true);
      expect(result.functionCalls.get('util').length).toBe(3);
    });
  });

  describe('Multiple Files', () => {
    it('should parse multiple JavaScript files', () => {
      writeFileSync(join(testDir, 'file1.js'), 'function func1() {}');
      writeFileSync(join(testDir, 'file2.js'), 'function func2() {}');

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('func1')).toBe(true);
      expect(result.functions.has('func2')).toBe(true);
    });
  });

  describe('Modern JavaScript Features', () => {
    it('should extract async function declarations', () => {
      const code = `
        async function fetchData() {
          const response = await fetch('/api/data');
          return response.json();
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('fetchData')).toBe(true);
      const func = result.functions.get('fetchData');
      expect(func.name).toBe('fetchData');
    });

    it('should extract async arrow functions', () => {
      const code = `
        const loadUser = async () => {
          const user = await getUser();
          return user;
        };
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('loadUser')).toBe(true);
    });

    it('should extract async class methods', () => {
      const code = `
        class DataService {
          async fetchData() {
            return await fetch('/data');
          }
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('fetchData')).toBe(true);
    });

    it('should handle destructuring in function parameters', () => {
      const code = `
        function processUser({ name, age, email }) {
          console.log(name);
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('processUser')).toBe(true);
    });

    it('should handle destructuring in arrow functions', () => {
      const code = `
        const getFullName = ({ firstName, lastName }) => {
          return firstName + ' ' + lastName;
        };
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('getFullName')).toBe(true);
    });

    it('should handle array destructuring in parameters', () => {
      const code = `
        function processCoords([x, y, z]) {
          return x + y + z;
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('processCoords')).toBe(true);
    });

    it('should handle rest parameters', () => {
      const code = `
        function sum(...numbers) {
          return numbers.reduce((a, b) => a + b, 0);
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('sum')).toBe(true);
    });

    it('should handle default parameters', () => {
      const code = `
        function greet(name = 'Guest', greeting = 'Hello') {
          return greeting + ' ' + name;
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('greet')).toBe(true);
    });

    it('should handle optional chaining in DOM queries', () => {
      const code = `
        function getElement() {
          const elem = document.getElementById('myElement');
          return elem?.value;
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      // Standard getElementById works fine
      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].selector).toBe('myElement');
    });

    it('should handle nullish coalescing in selectors', () => {
      const code = `
        function getElement(id) {
          const elem = document.getElementById(id ?? 'default');
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].selector).toBe('<dynamic>');
    });

    it('should handle template literals in DOM queries', () => {
      const code = `
        function getElement() {
          const elem = document.getElementById(\`element-\${id}\`);
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].selector).toBe('<dynamic>');
    });

    it('should handle simple template literals without expressions', () => {
      const code = `
        function getElement() {
          const elem = document.getElementById(\`myElement\`);
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].selector).toBe('myElement');
    });

    it('should handle generator functions', () => {
      const code = `
        function* generateSequence() {
          yield 1;
          yield 2;
          yield 3;
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('generateSequence')).toBe(true);
    });

    it('should handle async generator functions', () => {
      const code = `
        async function* asyncGenerator() {
          yield await Promise.resolve(1);
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('asyncGenerator')).toBe(true);
    });
  });

  describe('Additional Function Definition Syntaxes', () => {
    it('should extract exported function declarations', () => {
      const code = `
        export function exportedFunc() {
          return 'exported';
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('exportedFunc')).toBe(true);
      const func = result.functions.get('exportedFunc');
      expect(func.isExported).toBe(true);
    });

    it('should extract default exported functions', () => {
      const code = `
        export default function defaultFunc() {
          return 'default';
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('defaultFunc')).toBe(true);
    });

    it('should extract object method shorthand', () => {
      const code = `
        const obj = {
          shorthandMethod() {
            return 'shorthand';
          }
        };
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('shorthandMethod')).toBe(true);
    });

    it('should extract computed property methods', () => {
      const code = `
        const methodName = 'dynamicMethod';
        const obj = {
          [methodName]() {
            return 'computed';
          }
        };
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      // Computed properties won't be extracted as we can't determine the name statically
      // This test verifies the parser doesn't crash
      expect(() => parser.parse()).not.toThrow();
    });

    it('should extract static class methods', () => {
      const code = `
        class MyClass {
          static staticMethod() {
            return 'static';
          }
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('staticMethod')).toBe(true);
    });

    it('should extract getter and setter methods', () => {
      const code = `
        class MyClass {
          get value() {
            return this._value;
          }
          set value(val) {
            this._value = val;
          }
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functions.has('value')).toBe(true);
    });
  });

  describe('Additional DOM Query Methods', () => {
    it('should extract getElementsByClassName calls', () => {
      const code = `
        const elems = document.getElementsByClassName('my-class');
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].method).toBe('getElementsByClassName');
      expect(result.domQueries[0].selector).toBe('my-class');
    });

    it('should extract getElementsByTagName calls', () => {
      const code = `
        const divs = document.getElementsByTagName('div');
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].method).toBe('getElementsByTagName');
      expect(result.domQueries[0].selector).toBe('div');
    });

    it('should extract getElementsByName calls', () => {
      const code = `
        const inputs = document.getElementsByName('username');
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(1);
      expect(result.domQueries[0].method).toBe('getElementsByName');
      expect(result.domQueries[0].selector).toBe('username');
    });

    it('should extract DOM queries on element references', () => {
      const code = `
        function findChild() {
          const parent = document.getElementById('parent');
          const child = parent.querySelector('.child');
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.domQueries.length).toBe(2);
      expect(result.domQueries[0].selector).toBe('parent');
      expect(result.domQueries[1].selector).toBe('.child');
    });
  });

  describe('Advanced Function Call Tracking', () => {
    it('should track callback function calls', () => {
      const code = `
        function callback() {}
        function main() {
          setTimeout(callback, 1000);
        }
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functionCalls.has('callback')).toBe(true);
      expect(result.functionCalls.has('setTimeout')).toBe(true);
    });

    it('should track nested function calls', () => {
      const code = `
        function inner() {}
        function outer() {
          inner();
        }
        outer();
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functionCalls.has('inner')).toBe(true);
      expect(result.functionCalls.has('outer')).toBe(true);
      expect(result.functionCalls.get('inner')[0].context).toBe('outer');
    });

    it('should track constructor calls', () => {
      const code = `
        class MyClass {}
        const instance = new MyClass();
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functionCalls.has('MyClass')).toBe(true);
    });

    it('should track chained method calls', () => {
      const code = `
        obj.method1().method2().method3();
      `;
      writeFileSync(join(testDir, 'test.js'), code);

      const parser = new JavaScriptParser(testDir);
      const result = parser.parse();

      expect(result.functionCalls.has('method1')).toBe(true);
      expect(result.functionCalls.has('method2')).toBe(true);
      expect(result.functionCalls.has('method3')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JavaScript gracefully', () => {
      const code = `
        function broken() {
          // Missing closing brace
      `;
      writeFileSync(join(testDir, 'broken.js'), code);

      const parser = new JavaScriptParser(testDir);
      
      // Should not throw, just warn
      expect(() => parser.parse()).not.toThrow();
    });

    it('should handle files with syntax errors', () => {
      const code = `
        function test() {
          const x = ;
        }
      `;
      writeFileSync(join(testDir, 'syntax-error.js'), code);

      const parser = new JavaScriptParser(testDir);
      
      // Should not throw, just warn
      expect(() => parser.parse()).not.toThrow();
    });

    it('should handle empty files', () => {
      writeFileSync(join(testDir, 'empty.js'), '');

      const parser = new JavaScriptParser(testDir);
      
      expect(() => parser.parse()).not.toThrow();
    });
  });
});
