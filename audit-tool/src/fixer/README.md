# AutoFixer Module

The AutoFixer module provides automated fixing capabilities for issues identified during JavaScript-HTML connection analysis.

## Features

- **Safe Fix Identification**: Automatically identifies which issues can be safely fixed
- **Backup System**: Creates backups before modifying any files
- **Fix Application**: Applies fixes to JavaScript and HTML files
- **Rollback**: Restores files from backups if needed
- **Summary Generation**: Provides detailed reports of applied fixes

## Usage

### Basic Usage

```javascript
import { AutoFixer } from './fixer/index.js';

// Assume you have analysis results from the Analyzer
const analysisResults = {
  orphanedFunctions: [...],
  brokenHandlers: [...],
  unusedFunctions: [...],
  nonFunctionalElements: [...],
  patternIssues: [...]
};

// Create AutoFixer instance
const fixer = new AutoFixer(analysisResults, {
  backupDir: '.audit-backups'  // Optional, defaults to '.audit-backups'
});

// Get list of safe fixes
const safeFixes = fixer.getSafeFixes();
console.log(`Found ${safeFixes.length} safe fixes`);

// Apply fixes
const results = await fixer.applyFixes(safeFixes);
console.log(`Applied: ${results.applied.length}`);
console.log(`Failed: ${results.failed.length}`);

// Generate summary
const summary = fixer.generateFixSummary();
console.log(JSON.stringify(summary, null, 2));
```

### Selective Fix Application

```javascript
// Get all safe fixes
const allFixes = fixer.getSafeFixes();

// Filter to only remove unused functions
const unusedFunctionFixes = allFixes.filter(fix => fix.type === 'remove-function');

// Apply only those fixes
await fixer.applyFixes(unusedFunctionFixes);
```

### Rollback Changes

```javascript
// Apply fixes
await fixer.applyFixes(safeFixes);

// If something goes wrong, rollback
await fixer.rollback();
```

## Fix Types

### remove-function
Removes unused function declarations and expressions from JavaScript files.

**Safe when:**
- Function has zero call sites
- Function is not exported
- Function is not an event handler

**Example:**
```javascript
// Before
function unusedHelper() {
  return 42;
}

// After
// (function removed)
```

### remove-handler
Removes broken event handler attributes from HTML elements.

**Safe when:**
- Element ID is known
- Handler references a non-existent function

**Example:**
```html
<!-- Before -->
<button id="btn" onclick="missingFunction()">Click</button>

<!-- After -->
<button id="btn">Click</button>
```

## API Reference

### Constructor

```javascript
new AutoFixer(analysisResults, options)
```

**Parameters:**
- `analysisResults` (Object): Results from Analyzer.analyze()
- `options` (Object): Configuration options
  - `backupDir` (string): Directory for backups (default: '.audit-backups')

### Methods

#### getSafeFixes()
Returns an array of safe fixes that can be applied automatically.

**Returns:** `Fix[]`

```javascript
interface Fix {
  type: 'remove-function' | 'remove-handler' | 'add-function-stub';
  filePath: string;
  lineNumber: number;
  description: string;
  safe: boolean;
  metadata: Object;
}
```

#### createBackup(filePath)
Creates a backup of a file before modification.

**Parameters:**
- `filePath` (string): Path to file to backup

**Returns:** `Promise<string>` - Path to backup file

#### applyFixes(fixes)
Applies a list of fixes to the codebase.

**Parameters:**
- `fixes` (Fix[]): Array of fixes to apply

**Returns:** `Promise<FixResults>`

```javascript
interface FixResults {
  applied: Fix[];
  failed: Array<{fix: Fix, error: string}>;
  backupPaths: string[];
}
```

#### rollback()
Restores all modified files from backups and cleans up backup directory.

**Returns:** `Promise<void>`

#### generateFixSummary()
Generates a summary of all fixes applied.

**Returns:** `Object`

```javascript
{
  totalFixes: number;
  appliedCount: number;
  failedCount: number;
  backupCount: number;
  applied: Array<{type, description, filePath, lineNumber}>;
  failed: Array<{type, description, filePath, lineNumber, error}>;
  backups: Array<{original, backup}>;
}
```

## Safety Guarantees

1. **Backups**: All files are backed up before modification
2. **Atomic Operations**: Fixes are grouped by file to prevent partial modifications
3. **AST-Based**: JavaScript modifications use AST to ensure syntactic correctness
4. **Error Handling**: Errors are caught and reported without crashing
5. **Rollback**: All changes can be reverted

## Limitations

- Only supports JavaScript (.js) and HTML (.html) files
- Does not handle minified code well
- Cannot fix complex issues requiring human judgment
- Dynamic selectors and runtime-generated code may not be handled correctly

## Examples

See `AUTOFIXER_IMPLEMENTATION.md` for comprehensive examples and test results.
