# Analyzer Module

The Analyzer module cross-references HTML and JavaScript data to identify connection issues between the two.

## Features

### 1. Orphaned Function Detection
Identifies JavaScript functions that reference HTML elements that don't exist in the DOM.

**Example:**
```javascript
// JavaScript
function init() {
  const elem = document.getElementById('nonExistentElement');
}
```

If `nonExistentElement` doesn't exist in the HTML, this will be flagged as an orphaned function.

### 2. Broken Event Handler Detection
Identifies HTML event handlers that call JavaScript functions that don't exist.

**Example:**
```html
<!-- HTML -->
<button onclick="missingFunction()">Click</button>
```

If `missingFunction` is not defined in any JavaScript file, this will be flagged as a broken handler.

### 3. Unused Function Detection
Identifies JavaScript functions that are never called anywhere in the codebase.

**Rules:**
- Excludes exported functions (might be used externally)
- Excludes event handler functions (called by HTML)
- Only flags functions with zero call sites

### 4. Non-Functional Element Detection
Identifies interactive HTML elements (buttons, inputs, etc.) that have no event handlers or JavaScript references.

**Example:**
```html
<!-- HTML -->
<button id="myButton">Click</button>
```

If this button has no `onclick` attribute and is not referenced in JavaScript, it will be flagged as non-functional.

### 5. UI Pattern Validation
Validates that common UI patterns are properly implemented:

- **Modals**: Checks for open/close functions
- **Tabs**: Checks for switch/select functions
- **Forms**: Checks for submit handlers
- **Navigation**: Checks for navigation functions

## Usage

```javascript
import Analyzer from './analyzer/Analyzer.js';
import { HTMLParser } from './parsers/HTMLParser.js';
import { JavaScriptParser } from './parsers/JavaScriptParser.js';

// Parse HTML and JavaScript
const htmlParser = new HTMLParser('path/to/index.html');
const htmlData = htmlParser.parse();

const jsParser = new JavaScriptParser('path/to/js/directory');
const jsData = jsParser.parse();

// Analyze
const analyzer = new Analyzer(htmlData, jsData);
const results = analyzer.analyze();

// Access results
console.log('Orphaned Functions:', results.orphanedFunctions);
console.log('Broken Handlers:', results.brokenHandlers);
console.log('Unused Functions:', results.unusedFunctions);
console.log('Non-Functional Elements:', results.nonFunctionalElements);
console.log('Pattern Issues:', results.patternIssues);
```

## API

### Constructor

```javascript
new Analyzer(htmlData, jsData)
```

**Parameters:**
- `htmlData` (HTMLData): Parsed HTML data from HTMLParser
- `jsData` (JavaScriptData): Parsed JavaScript data from JavaScriptParser

### Methods

#### `analyze()`
Runs all analysis checks and returns complete results.

**Returns:** `AnalysisResults`

#### `findOrphanedFunctions()`
Finds functions that reference non-existent HTML elements.

**Returns:** `OrphanedFunction[]`

#### `findBrokenEventHandlers()`
Finds HTML event handlers that call non-existent functions.

**Returns:** `BrokenHandler[]`

#### `findUnusedFunctions()`
Finds functions that are never called.

**Returns:** `UnusedFunction[]`

#### `findNonFunctionalElements()`
Finds interactive elements without handlers.

**Returns:** `NonFunctionalElement[]`

#### `validateUIPatterns()`
Validates common UI patterns (modals, tabs, forms, navigation).

**Returns:** `PatternIssue[]`

## Data Structures

See `src/types/index.js` for complete type definitions.

### AnalysisResults
```javascript
{
  orphanedFunctions: OrphanedFunction[],
  brokenHandlers: BrokenHandler[],
  unusedFunctions: UnusedFunction[],
  nonFunctionalElements: NonFunctionalElement[],
  patternIssues: PatternIssue[]
}
```

### OrphanedFunction
```javascript
{
  functionName: string,
  filePath: string,
  lineNumber: number,
  missingElementId: string,
  queryMethod: string
}
```

### BrokenHandler
```javascript
{
  elementId: string | null,
  eventType: string,
  missingFunction: string,
  htmlLineNumber: number
}
```

### UnusedFunction
```javascript
{
  functionName: string,
  filePath: string,
  lineNumber: number,
  callCount: number
}
```

### NonFunctionalElement
```javascript
{
  elementId: string | null,
  tagName: string,
  htmlLineNumber: number,
  reason: string
}
```

### PatternIssue
```javascript
{
  pattern: string,
  elementId: string,
  missingComponents: string[],
  severity: 'critical' | 'warning' | 'info'
}
```

## Testing

The Analyzer module has comprehensive test coverage:

- **Unit Tests**: `tests/Analyzer.test.js` (18 tests)
- **Integration Tests**: `tests/Analyzer.integration.test.js` (6 tests)

Run tests with:
```bash
npm test
```

## Implementation Notes

### Pattern Matching
The analyzer uses naming conventions to detect UI patterns:
- Elements with "modal" in their ID are checked for modal patterns
- Elements with "tab" in their ID are checked for tab patterns
- Elements with "form" in their ID are checked for form patterns
- Elements with "nav" or "menu" in their ID are checked for navigation patterns

### Function Name Matching
For pattern validation, the analyzer looks for common function naming patterns:
- Modal: `openModal`, `showModal`, `closeModal`, `hideModal`
- Tab: `switchTab`, `selectTab`
- Form: `submitForm`, `handleSubmit`
- Navigation: `navigate`, `handleNavigation`

### Limitations
- Dynamic selectors (template strings with variables) cannot be fully validated
- Programmatic event listeners added via `addEventListener` are detected by checking if the element is referenced in JavaScript
- Minified code may produce incomplete results
