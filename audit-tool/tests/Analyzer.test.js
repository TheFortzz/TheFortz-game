/**
 * Unit tests for Analyzer class
 */

import { describe, it, expect } from 'vitest';
import Analyzer from '../src/analyzer/Analyzer.js';

describe('Analyzer', () => {
  describe('constructor', () => {
    it('should create an Analyzer instance with HTML and JS data', () => {
      const htmlData = {
        elementIds: new Set(['testId']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);

      expect(analyzer).toBeDefined();
      expect(analyzer.htmlData).toBe(htmlData);
      expect(analyzer.jsData).toBe(jsData);
    });
  });

  describe('analyze', () => {
    it('should return complete analysis results', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const results = analyzer.analyze();

      expect(results).toHaveProperty('orphanedFunctions');
      expect(results).toHaveProperty('brokenHandlers');
      expect(results).toHaveProperty('unusedFunctions');
      expect(results).toHaveProperty('nonFunctionalElements');
      expect(results).toHaveProperty('patternIssues');
      expect(Array.isArray(results.orphanedFunctions)).toBe(true);
      expect(Array.isArray(results.brokenHandlers)).toBe(true);
      expect(Array.isArray(results.unusedFunctions)).toBe(true);
      expect(Array.isArray(results.nonFunctionalElements)).toBe(true);
      expect(Array.isArray(results.patternIssues)).toBe(true);
    });
  });

  describe('findOrphanedFunctions', () => {
    it('should identify DOM queries for non-existent elements', () => {
      const htmlData = {
        elementIds: new Set(['existingId']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'getElementById',
            selector: 'missingId',
            filePath: 'test.js',
            lineNumber: 10,
            functionContext: 'testFunction'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const orphaned = analyzer.findOrphanedFunctions();

      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].missingElementId).toBe('missingId');
      expect(orphaned[0].functionName).toBe('testFunction');
      expect(orphaned[0].queryMethod).toBe('getElementById');
    });

    it('should not flag queries for existing elements', () => {
      const htmlData = {
        elementIds: new Set(['existingId']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'getElementById',
            selector: 'existingId',
            filePath: 'test.js',
            lineNumber: 10,
            functionContext: 'testFunction'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const orphaned = analyzer.findOrphanedFunctions();

      expect(orphaned).toHaveLength(0);
    });

    it('should handle querySelector with ID selectors', () => {
      const htmlData = {
        elementIds: new Set(['existingId']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'querySelector',
            selector: '#missingId',
            filePath: 'test.js',
            lineNumber: 10,
            functionContext: 'testFunction'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const orphaned = analyzer.findOrphanedFunctions();

      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].missingElementId).toBe('missingId');
    });

    it('should handle multiple orphaned functions from different files', () => {
      const htmlData = {
        elementIds: new Set(['validId']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'getElementById',
            selector: 'missingId1',
            filePath: 'file1.js',
            lineNumber: 10,
            functionContext: 'function1'
          },
          {
            method: 'getElementById',
            selector: 'missingId2',
            filePath: 'file2.js',
            lineNumber: 20,
            functionContext: 'function2'
          },
          {
            method: 'querySelector',
            selector: '#missingId3',
            filePath: 'file3.js',
            lineNumber: 30,
            functionContext: 'function3'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const orphaned = analyzer.findOrphanedFunctions();

      expect(orphaned).toHaveLength(3);
      expect(orphaned[0].missingElementId).toBe('missingId1');
      expect(orphaned[1].missingElementId).toBe('missingId2');
      expect(orphaned[2].missingElementId).toBe('missingId3');
    });

    it('should handle querySelectorAll with ID selectors', () => {
      const htmlData = {
        elementIds: new Set(['existingId']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'querySelectorAll',
            selector: '#missingId',
            filePath: 'test.js',
            lineNumber: 10,
            functionContext: 'testFunction'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const orphaned = analyzer.findOrphanedFunctions();

      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].missingElementId).toBe('missingId');
      expect(orphaned[0].queryMethod).toBe('querySelectorAll');
    });

    it('should ignore non-ID querySelector selectors', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'querySelector',
            selector: '.className',
            filePath: 'test.js',
            lineNumber: 10,
            functionContext: 'testFunction'
          },
          {
            method: 'querySelector',
            selector: 'div.container',
            filePath: 'test.js',
            lineNumber: 15,
            functionContext: 'testFunction'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const orphaned = analyzer.findOrphanedFunctions();

      expect(orphaned).toHaveLength(0);
    });
  });

  describe('findBrokenEventHandlers', () => {
    it('should identify event handlers calling non-existent functions', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [
          {
            elementId: 'button1',
            eventType: 'onclick',
            functionCall: 'missingFunction()',
            lineNumber: 5
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['existingFunction', { name: 'existingFunction', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const broken = analyzer.findBrokenEventHandlers();

      expect(broken).toHaveLength(1);
      expect(broken[0].missingFunction).toBe('missingFunction');
      expect(broken[0].elementId).toBe('button1');
      expect(broken[0].eventType).toBe('onclick');
    });

    it('should not flag handlers for existing functions', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [
          {
            elementId: 'button1',
            eventType: 'onclick',
            functionCall: 'existingFunction()',
            lineNumber: 5
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['existingFunction', { name: 'existingFunction', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const broken = analyzer.findBrokenEventHandlers();

      expect(broken).toHaveLength(0);
    });

    it('should handle multiple broken handlers', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [
          {
            elementId: 'button1',
            eventType: 'onclick',
            functionCall: 'missingFunction1()',
            lineNumber: 5
          },
          {
            elementId: 'input1',
            eventType: 'oninput',
            functionCall: 'missingFunction2()',
            lineNumber: 10
          },
          {
            elementId: 'form1',
            eventType: 'onsubmit',
            functionCall: 'validFunction()',
            lineNumber: 15
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['validFunction', { name: 'validFunction', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const broken = analyzer.findBrokenEventHandlers();

      expect(broken).toHaveLength(2);
      expect(broken[0].missingFunction).toBe('missingFunction1');
      expect(broken[0].eventType).toBe('onclick');
      expect(broken[1].missingFunction).toBe('missingFunction2');
      expect(broken[1].eventType).toBe('oninput');
    });

    it('should handle function calls with arguments', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [
          {
            elementId: 'button1',
            eventType: 'onclick',
            functionCall: 'handleClick(event, "arg")',
            lineNumber: 5
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['handleClick', { name: 'handleClick', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const broken = analyzer.findBrokenEventHandlers();

      expect(broken).toHaveLength(0);
    });

    it('should handle different event types', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [
          {
            elementId: 'input1',
            eventType: 'onchange',
            functionCall: 'missingOnChange()',
            lineNumber: 5
          },
          {
            elementId: 'input2',
            eventType: 'onkeyup',
            functionCall: 'missingOnKeyUp()',
            lineNumber: 10
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const broken = analyzer.findBrokenEventHandlers();

      expect(broken).toHaveLength(2);
      expect(broken[0].eventType).toBe('onchange');
      expect(broken[1].eventType).toBe('onkeyup');
    });
  });

  describe('findUnusedFunctions', () => {
    it('should identify functions with zero call sites', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['unusedFunction', { name: 'unusedFunction', filePath: 'test.js', lineNumber: 1, isExported: false }],
          ['usedFunction', { name: 'usedFunction', filePath: 'test.js', lineNumber: 10, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map([
          ['usedFunction', [{ filePath: 'test.js', lineNumber: 20, context: 'main' }]]
        ])
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const unused = analyzer.findUnusedFunctions();

      expect(unused).toHaveLength(1);
      expect(unused[0].functionName).toBe('unusedFunction');
      expect(unused[0].callCount).toBe(0);
    });

    it('should exclude exported functions from unused list', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['exportedFunction', { name: 'exportedFunction', filePath: 'test.js', lineNumber: 1, isExported: true }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const unused = analyzer.findUnusedFunctions();

      expect(unused).toHaveLength(0);
    });

    it('should exclude event handler functions from unused list', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [
          {
            elementId: 'button1',
            eventType: 'onclick',
            functionCall: 'handleClick()',
            lineNumber: 5
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['handleClick', { name: 'handleClick', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const unused = analyzer.findUnusedFunctions();

      expect(unused).toHaveLength(0);
    });

    it('should handle multiple unused functions', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['unused1', { name: 'unused1', filePath: 'file1.js', lineNumber: 1, isExported: false }],
          ['unused2', { name: 'unused2', filePath: 'file2.js', lineNumber: 5, isExported: false }],
          ['used', { name: 'used', filePath: 'file3.js', lineNumber: 10, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map([
          ['used', [{ filePath: 'file3.js', lineNumber: 20, context: 'main' }]]
        ])
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const unused = analyzer.findUnusedFunctions();

      expect(unused).toHaveLength(2);
      expect(unused.map(u => u.functionName)).toContain('unused1');
      expect(unused.map(u => u.functionName)).toContain('unused2');
    });

    it('should correctly report file paths and line numbers', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['unusedFunc', { name: 'unusedFunc', filePath: 'src/utils.js', lineNumber: 42, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const unused = analyzer.findUnusedFunctions();

      expect(unused).toHaveLength(1);
      expect(unused[0].filePath).toBe('src/utils.js');
      expect(unused[0].lineNumber).toBe(42);
    });

    it('should handle functions with multiple call sites', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['popularFunction', { name: 'popularFunction', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map([
          ['popularFunction', [
            { filePath: 'test.js', lineNumber: 10, context: 'func1' },
            { filePath: 'test.js', lineNumber: 20, context: 'func2' },
            { filePath: 'test.js', lineNumber: 30, context: 'func3' }
          ]]
        ])
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const unused = analyzer.findUnusedFunctions();

      expect(unused).toHaveLength(0);
    });
  });

  describe('findNonFunctionalElements', () => {
    it('should identify interactive elements without handlers', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: [
          {
            elementId: 'button1',
            tagName: 'button',
            hasEventHandler: false,
            lineNumber: 10
          }
        ]
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const nonFunctional = analyzer.findNonFunctionalElements();

      expect(nonFunctional).toHaveLength(1);
      expect(nonFunctional[0].elementId).toBe('button1');
      expect(nonFunctional[0].tagName).toBe('button');
    });

    it('should not flag elements with event handlers', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: [
          {
            elementId: 'button1',
            tagName: 'button',
            hasEventHandler: true,
            lineNumber: 10
          }
        ]
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const nonFunctional = analyzer.findNonFunctionalElements();

      expect(nonFunctional).toHaveLength(0);
    });

    it('should not flag elements referenced in JavaScript', () => {
      const htmlData = {
        elementIds: new Set(['button1']),
        eventHandlers: [],
        interactiveElements: [
          {
            elementId: 'button1',
            tagName: 'button',
            hasEventHandler: false,
            lineNumber: 10
          }
        ]
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'getElementById',
            selector: 'button1',
            filePath: 'test.js',
            lineNumber: 5,
            functionContext: 'init'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const nonFunctional = analyzer.findNonFunctionalElements();

      expect(nonFunctional).toHaveLength(0);
    });

    it('should handle multiple non-functional elements', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: [
          {
            elementId: 'button1',
            tagName: 'button',
            hasEventHandler: false,
            lineNumber: 10
          },
          {
            elementId: 'input1',
            tagName: 'input',
            hasEventHandler: false,
            lineNumber: 15
          },
          {
            elementId: 'select1',
            tagName: 'select',
            hasEventHandler: false,
            lineNumber: 20
          }
        ]
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const nonFunctional = analyzer.findNonFunctionalElements();

      expect(nonFunctional).toHaveLength(3);
      expect(nonFunctional.map(e => e.tagName)).toContain('button');
      expect(nonFunctional.map(e => e.tagName)).toContain('input');
      expect(nonFunctional.map(e => e.tagName)).toContain('select');
    });

    it('should not flag elements referenced via querySelector', () => {
      const htmlData = {
        elementIds: new Set(['myButton']),
        eventHandlers: [],
        interactiveElements: [
          {
            elementId: 'myButton',
            tagName: 'button',
            hasEventHandler: false,
            lineNumber: 10
          }
        ]
      };
      const jsData = {
        functions: new Map(),
        domQueries: [
          {
            method: 'querySelector',
            selector: '#myButton',
            filePath: 'test.js',
            lineNumber: 5,
            functionContext: 'init'
          }
        ],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const nonFunctional = analyzer.findNonFunctionalElements();

      expect(nonFunctional).toHaveLength(0);
    });

    it('should handle elements without IDs', () => {
      const htmlData = {
        elementIds: new Set(),
        eventHandlers: [],
        interactiveElements: [
          {
            elementId: null,
            tagName: 'button',
            hasEventHandler: false,
            lineNumber: 10
          }
        ]
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const nonFunctional = analyzer.findNonFunctionalElements();

      expect(nonFunctional).toHaveLength(1);
      expect(nonFunctional[0].elementId).toBeNull();
      expect(nonFunctional[0].reason).toBe('No event handler or JavaScript reference found');
    });
  });

  describe('validateUIPatterns', () => {
    it('should identify modal elements without open/close functions', () => {
      const htmlData = {
        elementIds: new Set(['testModal']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const modalIssues = issues.filter(issue => issue.pattern === 'modal');
      expect(modalIssues.length).toBeGreaterThan(0);
      expect(modalIssues[0].elementId).toBe('testModal');
      expect(modalIssues[0].missingComponents).toContain('open function');
      expect(modalIssues[0].missingComponents).toContain('close function');
    });

    it('should not flag modals with proper functions', () => {
      const htmlData = {
        elementIds: new Set(['testModal']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['openTestModal', { name: 'openTestModal', filePath: 'test.js', lineNumber: 1, isExported: false }],
          ['closeTestModal', { name: 'closeTestModal', filePath: 'test.js', lineNumber: 10, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const modalIssues = issues.filter(issue => issue.pattern === 'modal' && issue.elementId === 'testModal');
      expect(modalIssues).toHaveLength(0);
    });

    it('should recognize alternative modal function naming patterns', () => {
      const htmlData = {
        elementIds: new Set(['userModal']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['showUserModal', { name: 'showUserModal', filePath: 'test.js', lineNumber: 1, isExported: false }],
          ['hideUserModal', { name: 'hideUserModal', filePath: 'test.js', lineNumber: 10, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const modalIssues = issues.filter(issue => issue.pattern === 'modal' && issue.elementId === 'userModal');
      expect(modalIssues).toHaveLength(0);
    });

    it('should identify tab elements without switch functions', () => {
      const htmlData = {
        elementIds: new Set(['mainTab']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const tabIssues = issues.filter(issue => issue.pattern === 'tab');
      expect(tabIssues.length).toBeGreaterThan(0);
      expect(tabIssues[0].elementId).toBe('mainTab');
      expect(tabIssues[0].missingComponents).toContain('switch function');
    });

    it('should not flag tabs with generic switch function', () => {
      const htmlData = {
        elementIds: new Set(['settingsTab']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['switchTab', { name: 'switchTab', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const tabIssues = issues.filter(issue => issue.pattern === 'tab' && issue.elementId === 'settingsTab');
      expect(tabIssues).toHaveLength(0);
    });

    it('should identify form elements without submit handlers', () => {
      const htmlData = {
        elementIds: new Set(['loginForm']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const formIssues = issues.filter(issue => issue.pattern === 'form');
      expect(formIssues.length).toBeGreaterThan(0);
      expect(formIssues[0].elementId).toBe('loginForm');
      expect(formIssues[0].missingComponents).toContain('submit handler');
    });

    it('should not flag forms with onsubmit event handlers', () => {
      const htmlData = {
        elementIds: new Set(['contactForm']),
        eventHandlers: [
          {
            elementId: 'contactForm',
            eventType: 'onsubmit',
            functionCall: 'handleSubmit()',
            lineNumber: 5
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['handleSubmit', { name: 'handleSubmit', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const formIssues = issues.filter(issue => issue.pattern === 'form' && issue.elementId === 'contactForm');
      expect(formIssues).toHaveLength(0);
    });

    it('should identify navigation elements without navigation functions', () => {
      const htmlData = {
        elementIds: new Set(['mainNav']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const navIssues = issues.filter(issue => issue.pattern === 'navigation');
      expect(navIssues.length).toBeGreaterThan(0);
      expect(navIssues[0].elementId).toBe('mainNav');
      expect(navIssues[0].missingComponents).toContain('navigation function');
    });

    it('should not flag navigation with event handlers', () => {
      const htmlData = {
        elementIds: new Set(['sideMenu']),
        eventHandlers: [
          {
            elementId: 'sideMenu',
            eventType: 'onclick',
            functionCall: 'handleMenuClick()',
            lineNumber: 5
          }
        ],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map([
          ['handleMenuClick', { name: 'handleMenuClick', filePath: 'test.js', lineNumber: 1, isExported: false }]
        ]),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const navIssues = issues.filter(issue => issue.pattern === 'navigation' && issue.elementId === 'sideMenu');
      expect(navIssues).toHaveLength(0);
    });

    it('should assign correct severity levels to pattern issues', () => {
      const htmlData = {
        elementIds: new Set(['testModal', 'testTab', 'testForm', 'testNav']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const modalIssue = issues.find(i => i.pattern === 'modal');
      const tabIssue = issues.find(i => i.pattern === 'tab');
      const formIssue = issues.find(i => i.pattern === 'form');
      const navIssue = issues.find(i => i.pattern === 'navigation');

      expect(modalIssue?.severity).toBe('warning');
      expect(tabIssue?.severity).toBe('info');
      expect(formIssue?.severity).toBe('warning');
      expect(navIssue?.severity).toBe('info');
    });

    it('should handle multiple pattern issues across different elements', () => {
      const htmlData = {
        elementIds: new Set(['modal1', 'modal2', 'form1', 'tab1']),
        eventHandlers: [],
        interactiveElements: []
      };
      const jsData = {
        functions: new Map(),
        domQueries: [],
        functionCalls: new Map()
      };

      const analyzer = new Analyzer(htmlData, jsData);
      const issues = analyzer.validateUIPatterns();

      const modalIssues = issues.filter(i => i.pattern === 'modal');
      const formIssues = issues.filter(i => i.pattern === 'form');
      const tabIssues = issues.filter(i => i.pattern === 'tab');

      expect(modalIssues.length).toBeGreaterThanOrEqual(2);
      expect(formIssues.length).toBeGreaterThanOrEqual(1);
      expect(tabIssues.length).toBeGreaterThanOrEqual(1);
    });
  });
});
