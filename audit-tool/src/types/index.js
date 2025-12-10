/**
 * Type definitions for the audit tool
 * 
 * These JSDoc type definitions provide type safety without requiring TypeScript compilation.
 */

/**
 * @typedef {Object} HTMLData
 * @property {Set<string>} elementIds - All element IDs found in HTML
 * @property {EventHandler[]} eventHandlers - All event handlers found in HTML
 * @property {InteractiveElement[]} interactiveElements - All interactive elements
 */

/**
 * @typedef {Object} EventHandler
 * @property {string|null} elementId - ID of the element with the handler
 * @property {string} eventType - Type of event (onclick, oninput, etc.)
 * @property {string} functionCall - Function being called
 * @property {number} lineNumber - Line number in HTML file
 */

/**
 * @typedef {Object} InteractiveElement
 * @property {string|null} elementId - ID of the interactive element
 * @property {string} tagName - HTML tag name
 * @property {boolean} hasEventHandler - Whether element has an event handler
 * @property {number} lineNumber - Line number in HTML file
 */

/**
 * @typedef {Object} JavaScriptData
 * @property {Map<string, FunctionDef>} functions - All function definitions
 * @property {DOMQuery[]} domQueries - All DOM queries
 * @property {Map<string, CallSite[]>} functionCalls - All function calls
 */

/**
 * @typedef {Object} FunctionDef
 * @property {string} name - Function name
 * @property {string} filePath - File containing the function
 * @property {number} lineNumber - Line number of function definition
 * @property {boolean} isExported - Whether function is exported
 */

/**
 * @typedef {Object} DOMQuery
 * @property {string} method - Query method (getElementById, querySelector, etc.)
 * @property {string} selector - Selector string
 * @property {string} filePath - File containing the query
 * @property {number} lineNumber - Line number of query
 * @property {string} functionContext - Function containing the query
 */

/**
 * @typedef {Object} CallSite
 * @property {string} filePath - File containing the call
 * @property {number} lineNumber - Line number of call
 * @property {string} context - Context of the call
 */

/**
 * @typedef {Object} AnalysisResults
 * @property {OrphanedFunction[]} orphanedFunctions - Functions referencing non-existent elements
 * @property {BrokenHandler[]} brokenHandlers - Event handlers calling non-existent functions
 * @property {UnusedFunction[]} unusedFunctions - Functions that are never called
 * @property {NonFunctionalElement[]} nonFunctionalElements - Interactive elements without handlers
 * @property {PatternIssue[]} patternIssues - Incomplete UI patterns
 */

/**
 * @typedef {Object} OrphanedFunction
 * @property {string} functionName - Name of the orphaned function
 * @property {string} filePath - File containing the function
 * @property {number} lineNumber - Line number
 * @property {string} missingElementId - ID of missing element
 * @property {string} queryMethod - Query method used
 */

/**
 * @typedef {Object} BrokenHandler
 * @property {string|null} elementId - ID of element with broken handler
 * @property {string} eventType - Event type
 * @property {string} missingFunction - Name of missing function
 * @property {number} htmlLineNumber - Line number in HTML
 */

/**
 * @typedef {Object} UnusedFunction
 * @property {string} functionName - Name of unused function
 * @property {string} filePath - File containing the function
 * @property {number} lineNumber - Line number
 * @property {number} callCount - Number of times called (should be 0)
 */

/**
 * @typedef {Object} NonFunctionalElement
 * @property {string|null} elementId - ID of non-functional element
 * @property {string} tagName - HTML tag name
 * @property {number} htmlLineNumber - Line number in HTML
 * @property {string} reason - Reason element is non-functional
 */

/**
 * @typedef {Object} PatternIssue
 * @property {string} pattern - Pattern type (modal, tab, form, etc.)
 * @property {string} elementId - ID of element with pattern issue
 * @property {string[]} missingComponents - List of missing components
 * @property {'critical'|'warning'|'info'} severity - Issue severity
 */

/**
 * @typedef {Object} Fix
 * @property {'remove-function'|'remove-handler'|'add-function-stub'} type - Type of fix
 * @property {string} filePath - File to fix
 * @property {number} lineNumber - Line number
 * @property {string} description - Description of fix
 * @property {boolean} safe - Whether fix is safe to apply automatically
 */

/**
 * @typedef {Object} FixResults
 * @property {Fix[]} applied - Successfully applied fixes
 * @property {Array<{fix: Fix, error: string}>} failed - Failed fixes
 * @property {string[]} backupPaths - Paths to backup files
 */

export {};
