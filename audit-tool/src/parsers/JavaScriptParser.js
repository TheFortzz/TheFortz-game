/**
 * JavaScriptParser - Parses JavaScript files to extract function definitions,
 * DOM queries, and function calls
 */

import { parse } from '@babel/parser';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { resolve, relative } from 'path';

/**
 * @typedef {import('../types/index.js').JavaScriptData} JavaScriptData
 * @typedef {import('../types/index.js').FunctionDef} FunctionDef
 * @typedef {import('../types/index.js').DOMQuery} DOMQuery
 * @typedef {import('../types/index.js').CallSite} CallSite
 */

export class JavaScriptParser {
  /**
   * Create a JavaScriptParser
   * @param {string} jsDirectory - Path to directory containing JavaScript files
   */
  constructor(jsDirectory) {
    this.jsDirectory = resolve(jsDirectory);
    this.functions = new Map();
    this.domQueries = [];
    this.functionCalls = new Map();
  }

  /**
   * Parse all JavaScript files in the directory
   * @returns {JavaScriptData}
   */
  parse() {
    // Find all JavaScript files
    const jsFiles = glob.sync('**/*.js', {
      cwd: this.jsDirectory,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    // Parse each file
    for (const filePath of jsFiles) {
      try {
        this.parseFile(filePath);
      } catch (error) {
        console.warn(`Warning: Failed to parse ${filePath}: ${error.message}`);
      }
    }

    return {
      functions: this.functions,
      domQueries: this.domQueries,
      functionCalls: this.functionCalls
    };
  }

  /**
   * Parse a single JavaScript file
   * @param {string} filePath - Path to JavaScript file
   * @private
   */
  parseFile(filePath) {
    const code = readFileSync(filePath, 'utf-8');
    const relativePath = relative(process.cwd(), filePath);

    // Parse with Babel - support both ES6 and CommonJS
    const ast = parse(code, {
      sourceType: 'unambiguous', // Auto-detect module vs script
      plugins: [
        'jsx',
        'typescript',
        'classProperties',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'objectRestSpread',
        'optionalChaining',
        'nullishCoalescingOperator'
      ],
      errorRecovery: true
    });

    // Walk the AST to extract data
    this.walkAST(ast, relativePath);
  }

  /**
   * Walk the AST to extract function definitions, DOM queries, and function calls
   * @param {Object} ast - Babel AST
   * @param {string} filePath - File path for context
   * @private
   */
  walkAST(ast, filePath) {
    const self = this;
    let currentFunction = null;

    /**
     * Recursively traverse AST nodes
     * @param {Object} node - AST node
     */
    function traverse(node) {
      if (!node || typeof node !== 'object') return;

      // Extract function definitions
      self.extractFunctionDefinition(node, filePath);

      // Track current function context for DOM queries
      const previousFunction = currentFunction;
      if (node.type === 'FunctionDeclaration' || 
          node.type === 'FunctionExpression' || 
          node.type === 'ArrowFunctionExpression') {
        currentFunction = self.getFunctionName(node) || 'anonymous';
      }

      // Extract DOM queries
      self.extractDOMQuery(node, filePath, currentFunction);
      
      // Extract function calls (including constructor calls)
      if (node.type === 'CallExpression' || node.type === 'NewExpression') {
        self.extractFunctionCall(node, filePath, currentFunction);
      }

      // Skip traversing children of export nodes since we handle them manually
      // This prevents double-processing and overwriting the isExported flag
      if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
        // Still need to traverse non-declaration children (like specifiers)
        for (const key in node) {
          if (key === 'loc' || key === 'start' || key === 'end' || key === 'declaration') continue;
          const child = node[key];
          
          if (Array.isArray(child)) {
            child.forEach(traverse);
          } else if (child && typeof child === 'object') {
            traverse(child);
          }
        }
        currentFunction = previousFunction;
        return;
      }

      // Traverse child nodes
      for (const key in node) {
        if (key === 'loc' || key === 'start' || key === 'end') continue;
        const child = node[key];
        
        if (Array.isArray(child)) {
          child.forEach(traverse);
        } else if (child && typeof child === 'object') {
          traverse(child);
        }
      }

      // Restore previous function context
      currentFunction = previousFunction;
    }

    traverse(ast.program);
  }

  /**
   * Extract function definition from AST node
   * @param {Object} node - AST node
   * @param {string} filePath - File path
   * @param {boolean} parentIsExported - Whether parent node is an export
   * @private
   */
  extractFunctionDefinition(node, filePath, parentIsExported = false) {
    let functionName = null;
    let isExported = parentIsExported;
    let lineNumber = node.loc?.start.line || 0;

    // Check for exports first
    if (node.type === 'ExportNamedDeclaration' || 
        node.type === 'ExportDefaultDeclaration') {
      // Recurse to extract the actual function with exported flag
      if (node.declaration) {
        this.extractFunctionDefinition(node.declaration, filePath, true);
      }
      return;
    }

    // Function declarations: function foo() {}
    if (node.type === 'FunctionDeclaration') {
      functionName = node.id?.name;
    }
    
    // Variable declarations with function expressions: const foo = function() {}
    // or arrow functions: const foo = () => {}
    else if (node.type === 'VariableDeclaration') {
      for (const declarator of node.declarations) {
        if (declarator.init && 
            (declarator.init.type === 'FunctionExpression' || 
             declarator.init.type === 'ArrowFunctionExpression')) {
          functionName = declarator.id?.name;
          lineNumber = declarator.loc?.start.line || lineNumber;
          
          // Store this function with export status
          if (functionName) {
            this.functions.set(functionName, {
              name: functionName,
              filePath,
              lineNumber,
              isExported
            });
          }
        }
      }
      return; // Early return to avoid double-storing
    }
    
    // Class methods: class Foo { bar() {} }
    else if (node.type === 'MethodDefinition' || node.type === 'ClassMethod') {
      if (node.key.type === 'Identifier') {
        functionName = node.key.name;
      }
    }
    
    // Object method shorthand: { foo() {} }
    else if (node.type === 'ObjectMethod') {
      if (node.key.type === 'Identifier') {
        functionName = node.key.name;
      }
    }
    
    // Property with function value: { foo: function() {} } or { foo: () => {} }
    else if (node.type === 'ObjectProperty' || node.type === 'Property') {
      if (node.value && 
          (node.value.type === 'FunctionExpression' || 
           node.value.type === 'ArrowFunctionExpression')) {
        if (node.key.type === 'Identifier') {
          functionName = node.key.name;
        }
      }
    }

    // Store function definition
    if (functionName) {
      this.functions.set(functionName, {
        name: functionName,
        filePath,
        lineNumber,
        isExported
      });
    }
  }

  /**
   * Get function name from AST node
   * @param {Object} node - AST node
   * @returns {string|null}
   * @private
   */
  getFunctionName(node) {
    if (node.type === 'FunctionDeclaration' && node.id) {
      return node.id.name;
    }
    return null;
  }

  /**
   * Extract DOM query from AST node
   * @param {Object} node - AST node
   * @param {string} filePath - File path
   * @param {string|null} functionContext - Current function context
   * @private
   */
  extractDOMQuery(node, filePath, functionContext) {
    // Look for CallExpression nodes
    if (node.type !== 'CallExpression') return;

    let method = null;
    let selector = null;
    const lineNumber = node.loc?.start.line || 0;

    // document.getElementById('foo') or document?.getElementById('foo')
    if (node.callee.type === 'MemberExpression' || node.callee.type === 'OptionalMemberExpression') {
      const object = node.callee.object;
      const property = node.callee.property;

      // Check if it's a document method
      if (object.type === 'Identifier' && object.name === 'document') {
        if (property.type === 'Identifier') {
          method = property.name;
        }
      }
      // Also check for element.querySelector, etc.
      else if (property.type === 'Identifier') {
        const propertyName = property.name;
        if (propertyName === 'querySelector' || 
            propertyName === 'querySelectorAll' ||
            propertyName === 'getElementById' ||
            propertyName === 'getElementsByClassName' ||
            propertyName === 'getElementsByTagName' ||
            propertyName === 'getElementsByName') {
          method = propertyName;
        }
      }
    }
    // Handle optional call expressions: document?.getElementById?.('foo')
    else if (node.callee.type === 'OptionalCallExpression') {
      // Recursively check the callee
      if (node.callee.callee && 
          (node.callee.callee.type === 'MemberExpression' || 
           node.callee.callee.type === 'OptionalMemberExpression')) {
        const object = node.callee.callee.object;
        const property = node.callee.callee.property;
        
        if (object.type === 'Identifier' && object.name === 'document') {
          if (property.type === 'Identifier') {
            method = property.name;
          }
        }
      }
    }

    // Extract selector from first argument
    if (method && node.arguments.length > 0) {
      const firstArg = node.arguments[0];
      
      // String literal: 'foo' or "foo"
      if (firstArg.type === 'StringLiteral' || firstArg.type === 'Literal') {
        selector = firstArg.value;
      }
      // Template literal: `foo`
      else if (firstArg.type === 'TemplateLiteral') {
        // If it's a simple template with no expressions, extract it
        if (firstArg.expressions.length === 0 && firstArg.quasis.length === 1) {
          selector = firstArg.quasis[0].value.cooked;
        } else {
          // Dynamic selector - mark as such
          selector = '<dynamic>';
        }
      }
      // Variable or expression - mark as dynamic
      else {
        selector = '<dynamic>';
      }
    }

    // Store DOM query if we found one
    if (method && selector) {
      this.domQueries.push({
        method,
        selector,
        filePath,
        lineNumber,
        functionContext: functionContext || 'global'
      });
    }
  }

  /**
   * Extract function call from AST node
   * @param {Object} node - AST node
   * @param {string} filePath - File path
   * @param {string|null} functionContext - Current function context
   * @private
   */
  extractFunctionCall(node, filePath, functionContext) {
    let functionName = null;
    const lineNumber = node.loc?.start.line || 0;

    // Handle CallExpression: foo() or new Foo()
    if (node.type === 'CallExpression' || node.type === 'NewExpression') {
      // Direct function call: foo() or new Foo()
      if (node.callee.type === 'Identifier') {
        functionName = node.callee.name;
      }
      // Method call: obj.foo()
      else if (node.callee.type === 'MemberExpression') {
        if (node.callee.property.type === 'Identifier') {
          functionName = node.callee.property.name;
        }
      }

      // Store function call
      if (functionName) {
        if (!this.functionCalls.has(functionName)) {
          this.functionCalls.set(functionName, []);
        }

        this.functionCalls.get(functionName).push({
          filePath,
          lineNumber,
          context: functionContext || 'global'
        });
      }

      // Also track functions passed as arguments (callbacks)
      if (node.arguments) {
        for (const arg of node.arguments) {
          if (arg.type === 'Identifier') {
            // This is a function reference being passed as callback
            const callbackName = arg.name;
            if (!this.functionCalls.has(callbackName)) {
              this.functionCalls.set(callbackName, []);
            }
            this.functionCalls.get(callbackName).push({
              filePath,
              lineNumber,
              context: functionContext || 'global'
            });
          }
        }
      }
    }
  }

  /**
   * Get all function definitions
   * @returns {Map<string, FunctionDef>}
   */
  getFunctionDefinitions() {
    return this.functions;
  }

  /**
   * Get all DOM queries
   * @returns {DOMQuery[]}
   */
  getDOMQueries() {
    return this.domQueries;
  }

  /**
   * Get all function calls
   * @returns {Map<string, CallSite[]>}
   */
  getFunctionCalls() {
    return this.functionCalls;
  }
}
