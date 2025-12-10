/**
 * Analyzer - Cross-references HTML and JavaScript data to identify issues
 */

/**
 * @typedef {import('../types/index.js').HTMLData} HTMLData
 * @typedef {import('../types/index.js').JavaScriptData} JavaScriptData
 * @typedef {import('../types/index.js').AnalysisResults} AnalysisResults
 * @typedef {import('../types/index.js').OrphanedFunction} OrphanedFunction
 * @typedef {import('../types/index.js').BrokenHandler} BrokenHandler
 * @typedef {import('../types/index.js').UnusedFunction} UnusedFunction
 * @typedef {import('../types/index.js').NonFunctionalElement} NonFunctionalElement
 * @typedef {import('../types/index.js').PatternIssue} PatternIssue
 */

class Analyzer {
  /**
   * Create an Analyzer instance
   * @param {HTMLData} htmlData - Parsed HTML data
   * @param {JavaScriptData} jsData - Parsed JavaScript data
   */
  constructor(htmlData, jsData) {
    this.htmlData = htmlData;
    this.jsData = jsData;
  }

  /**
   * Run all analysis checks
   * @returns {AnalysisResults} Complete analysis results
   */
  analyze() {
    return {
      orphanedFunctions: this.findOrphanedFunctions(),
      brokenHandlers: this.findBrokenEventHandlers(),
      unusedFunctions: this.findUnusedFunctions(),
      nonFunctionalElements: this.findNonFunctionalElements(),
      patternIssues: this.validateUIPatterns()
    };
  }

  /**
   * Find functions that reference non-existent HTML elements
   * @returns {OrphanedFunction[]} List of orphaned functions
   */
  findOrphanedFunctions() {
    const orphaned = [];
    const elementIds = this.htmlData.elementIds;

    for (const query of this.jsData.domQueries) {
      // Check if this is an ID-based query
      if (query.method === 'getElementById') {
        // For getElementById, the selector is the ID directly
        if (!elementIds.has(query.selector)) {
          orphaned.push({
            functionName: query.functionContext,
            filePath: query.filePath,
            lineNumber: query.lineNumber,
            missingElementId: query.selector,
            queryMethod: query.method
          });
        }
      } else if (query.method === 'querySelector' || query.method === 'querySelectorAll') {
        // For querySelector, check if it's an ID selector (#id)
        const idMatch = query.selector.match(/^#([a-zA-Z0-9_-]+)$/);
        if (idMatch) {
          const id = idMatch[1];
          if (!elementIds.has(id)) {
            orphaned.push({
              functionName: query.functionContext,
              filePath: query.filePath,
              lineNumber: query.lineNumber,
              missingElementId: id,
              queryMethod: query.method
            });
          }
        }
      }
    }

    return orphaned;
  }

  /**
   * Find HTML event handlers that call non-existent functions
   * @returns {BrokenHandler[]} List of broken event handlers
   */
  findBrokenEventHandlers() {
    const broken = [];
    const functionNames = new Set(this.jsData.functions.keys());

    for (const handler of this.htmlData.eventHandlers) {
      // Extract function name from function call
      // Handle cases like "functionName()", "functionName(arg)", "obj.method()"
      const functionMatch = handler.functionCall.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      
      if (functionMatch) {
        const functionName = functionMatch[1];
        
        // Check if function exists in JavaScript
        if (!functionNames.has(functionName)) {
          broken.push({
            elementId: handler.elementId,
            eventType: handler.eventType,
            missingFunction: functionName,
            htmlLineNumber: handler.lineNumber
          });
        }
      }
    }

    return broken;
  }

  /**
   * Find functions that are never called
   * @returns {UnusedFunction[]} List of unused functions
   */
  findUnusedFunctions() {
    const unused = [];
    const eventHandlerFunctions = new Set();

    // Collect all functions called by event handlers
    for (const handler of this.htmlData.eventHandlers) {
      const functionMatch = handler.functionCall.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (functionMatch) {
        eventHandlerFunctions.add(functionMatch[1]);
      }
    }

    // Check each function
    for (const [functionName, functionDef] of this.jsData.functions.entries()) {
      // Skip if function is exported (might be used externally)
      if (functionDef.isExported) {
        continue;
      }

      // Skip if function is an event handler
      if (eventHandlerFunctions.has(functionName)) {
        continue;
      }

      // Count call sites
      const callSites = this.jsData.functionCalls.get(functionName) || [];
      
      if (callSites.length === 0) {
        unused.push({
          functionName: functionName,
          filePath: functionDef.filePath,
          lineNumber: functionDef.lineNumber,
          callCount: 0
        });
      }
    }

    return unused;
  }

  /**
   * Find interactive elements without event handlers
   * @returns {NonFunctionalElement[]} List of non-functional elements
   */
  findNonFunctionalElements() {
    const nonFunctional = [];

    for (const element of this.htmlData.interactiveElements) {
      // Skip if element already has an event handler
      if (element.hasEventHandler) {
        continue;
      }

      // Check if element is referenced in JavaScript (programmatic event listeners)
      if (element.elementId) {
        const isReferenced = this.jsData.domQueries.some(query => {
          if (query.method === 'getElementById') {
            return query.selector === element.elementId;
          } else if (query.method === 'querySelector' || query.method === 'querySelectorAll') {
            return query.selector === `#${element.elementId}`;
          }
          return false;
        });

        // If referenced in JS, assume it has programmatic event listeners
        if (isReferenced) {
          continue;
        }
      }

      // Element is interactive but has no handler
      nonFunctional.push({
        elementId: element.elementId,
        tagName: element.tagName,
        htmlLineNumber: element.lineNumber,
        reason: 'No event handler or JavaScript reference found'
      });
    }

    return nonFunctional;
  }

  /**
   * Validate common UI patterns (modals, tabs, forms, navigation)
   * @returns {PatternIssue[]} List of pattern issues
   */
  validateUIPatterns() {
    const issues = [];

    // Validate modal patterns
    issues.push(...this._validateModalPatterns());

    // Validate tab patterns
    issues.push(...this._validateTabPatterns());

    // Validate form patterns
    issues.push(...this._validateFormPatterns());

    // Validate navigation patterns
    issues.push(...this._validateNavigationPatterns());

    return issues;
  }

  /**
   * Validate modal patterns (open/close functions)
   * @private
   * @returns {PatternIssue[]} Modal pattern issues
   */
  _validateModalPatterns() {
    const issues = [];
    const functionNames = new Set(this.jsData.functions.keys());

    // Find all modal elements
    for (const elementId of this.htmlData.elementIds) {
      if (elementId.toLowerCase().includes('modal')) {
        const missingComponents = [];

        // Check for open function
        const openFunctionNames = [
          `open${this._capitalize(elementId)}`,
          `show${this._capitalize(elementId)}`,
          `${elementId}Open`,
          `${elementId}Show`
        ];

        const hasOpenFunction = openFunctionNames.some(name => functionNames.has(name));
        if (!hasOpenFunction) {
          missingComponents.push('open function');
        }

        // Check for close function
        const closeFunctionNames = [
          `close${this._capitalize(elementId)}`,
          `hide${this._capitalize(elementId)}`,
          `${elementId}Close`,
          `${elementId}Hide`
        ];

        const hasCloseFunction = closeFunctionNames.some(name => functionNames.has(name));
        if (!hasCloseFunction) {
          missingComponents.push('close function');
        }

        if (missingComponents.length > 0) {
          issues.push({
            pattern: 'modal',
            elementId: elementId,
            missingComponents: missingComponents,
            severity: 'warning'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate tab patterns (switch functions)
   * @private
   * @returns {PatternIssue[]} Tab pattern issues
   */
  _validateTabPatterns() {
    const issues = [];
    const functionNames = new Set(this.jsData.functions.keys());

    // Find all tab elements
    for (const elementId of this.htmlData.elementIds) {
      if (elementId.toLowerCase().includes('tab')) {
        const missingComponents = [];

        // Check for switch/select function
        const switchFunctionNames = [
          `switch${this._capitalize(elementId)}`,
          `select${this._capitalize(elementId)}`,
          `${elementId}Switch`,
          `${elementId}Select`,
          'switchTab',
          'selectTab'
        ];

        const hasSwitchFunction = switchFunctionNames.some(name => functionNames.has(name));
        if (!hasSwitchFunction) {
          missingComponents.push('switch function');
        }

        if (missingComponents.length > 0) {
          issues.push({
            pattern: 'tab',
            elementId: elementId,
            missingComponents: missingComponents,
            severity: 'info'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate form patterns (submit handlers)
   * @private
   * @returns {PatternIssue[]} Form pattern issues
   */
  _validateFormPatterns() {
    const issues = [];
    const functionNames = new Set(this.jsData.functions.keys());

    // Find all form elements
    for (const elementId of this.htmlData.elementIds) {
      if (elementId.toLowerCase().includes('form')) {
        const missingComponents = [];

        // Check for submit handler
        const submitFunctionNames = [
          `submit${this._capitalize(elementId)}`,
          `${elementId}Submit`,
          `handle${this._capitalize(elementId)}Submit`,
          'handleSubmit'
        ];

        const hasSubmitHandler = submitFunctionNames.some(name => functionNames.has(name));
        
        // Also check if form has onsubmit event handler
        const hasEventHandler = this.htmlData.eventHandlers.some(
          handler => handler.elementId === elementId && handler.eventType === 'onsubmit'
        );

        if (!hasSubmitHandler && !hasEventHandler) {
          missingComponents.push('submit handler');
        }

        if (missingComponents.length > 0) {
          issues.push({
            pattern: 'form',
            elementId: elementId,
            missingComponents: missingComponents,
            severity: 'warning'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate navigation patterns
   * @private
   * @returns {PatternIssue[]} Navigation pattern issues
   */
  _validateNavigationPatterns() {
    const issues = [];
    const functionNames = new Set(this.jsData.functions.keys());

    // Find all navigation elements
    for (const elementId of this.htmlData.elementIds) {
      if (elementId.toLowerCase().includes('nav') || 
          elementId.toLowerCase().includes('menu')) {
        const missingComponents = [];

        // Check for navigation function
        const navFunctionNames = [
          `navigate${this._capitalize(elementId)}`,
          `${elementId}Navigate`,
          `handle${this._capitalize(elementId)}`,
          'navigate',
          'handleNavigation'
        ];

        const hasNavFunction = navFunctionNames.some(name => functionNames.has(name));
        
        // Also check if nav has event handlers
        const hasEventHandler = this.htmlData.eventHandlers.some(
          handler => handler.elementId === elementId
        );

        if (!hasNavFunction && !hasEventHandler) {
          missingComponents.push('navigation function');
        }

        if (missingComponents.length > 0) {
          issues.push({
            pattern: 'navigation',
            elementId: elementId,
            missingComponents: missingComponents,
            severity: 'info'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Capitalize first letter of string
   * @private
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default Analyzer;
