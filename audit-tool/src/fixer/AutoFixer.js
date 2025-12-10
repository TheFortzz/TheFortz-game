/**
 * AutoFixer - Automatically fixes simple issues found during analysis
 */

import fs from 'fs-extra';
import path from 'path';
import { parse } from '@babel/parser';
import _generate from '@babel/generator';

// Handle default export from @babel/generator
const generate = _generate.default || _generate;

/**
 * @typedef {import('../types/index.js').AnalysisResults} AnalysisResults
 * @typedef {import('../types/index.js').Fix} Fix
 * @typedef {import('../types/index.js').FixResults} FixResults
 */

class AutoFixer {
  /**
   * Create an AutoFixer instance
   * @param {AnalysisResults} analysisResults - Results from analysis
   * @param {Object} options - Configuration options
   * @param {string} options.backupDir - Directory for backups
   */
  constructor(analysisResults, options = {}) {
    this.analysisResults = analysisResults;
    this.backupDir = options.backupDir || '.audit-backups';
    this.backups = new Map(); // filePath -> backupPath
    this.appliedFixes = [];
    this.failedFixes = [];
  }

  /**
   * Get list of safe fixes that can be applied automatically
   * @returns {Fix[]} List of safe fixes
   */
  getSafeFixes() {
    const fixes = [];

    // Identify removable unused functions
    for (const unusedFunc of this.analysisResults.unusedFunctions) {
      fixes.push({
        type: 'remove-function',
        filePath: unusedFunc.filePath,
        lineNumber: unusedFunc.lineNumber,
        description: `Remove unused function '${unusedFunc.functionName}'`,
        safe: true,
        metadata: {
          functionName: unusedFunc.functionName
        }
      });
    }

    // Identify removable broken event handlers (from HTML)
    for (const brokenHandler of this.analysisResults.brokenHandlers) {
      // Only mark as safe if we can identify the element
      const safe = brokenHandler.elementId !== null;
      
      fixes.push({
        type: 'remove-handler',
        filePath: 'html', // Special marker for HTML file
        lineNumber: brokenHandler.htmlLineNumber,
        description: `Remove broken event handler '${brokenHandler.eventType}="${brokenHandler.missingFunction}()"' from element ${brokenHandler.elementId || 'unknown'}`,
        safe: safe,
        metadata: {
          elementId: brokenHandler.elementId,
          eventType: brokenHandler.eventType,
          missingFunction: brokenHandler.missingFunction
        }
      });
    }

    return fixes;
  }

  /**
   * Create backup of a file before modification
   * @param {string} filePath - Path to file to backup
   * @returns {Promise<string>} Path to backup file
   */
  async createBackup(filePath) {
    // Check if already backed up
    if (this.backups.has(filePath)) {
      return this.backups.get(filePath);
    }

    // Create backup directory if it doesn't exist
    await fs.ensureDir(this.backupDir);

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const basename = path.basename(filePath);
    const backupPath = path.join(this.backupDir, `${basename}.${timestamp}.backup`);

    // Copy file to backup location
    await fs.copy(filePath, backupPath);

    // Track backup
    this.backups.set(filePath, backupPath);

    return backupPath;
  }

  /**
   * Apply a list of fixes
   * @param {Fix[]} fixes - Fixes to apply
   * @returns {Promise<FixResults>} Results of fix application
   */
  async applyFixes(fixes) {
    this.appliedFixes = [];
    this.failedFixes = [];

    // Group fixes by file
    const fixesByFile = new Map();
    for (const fix of fixes) {
      if (!fixesByFile.has(fix.filePath)) {
        fixesByFile.set(fix.filePath, []);
      }
      fixesByFile.get(fix.filePath).push(fix);
    }

    // Apply fixes file by file
    for (const [filePath, fileFixes] of fixesByFile.entries()) {
      try {
        // Create backup before modifying
        await this.createBackup(filePath);

        // Apply fixes to this file
        await this._applyFixesToFile(filePath, fileFixes);

        // Mark all fixes as applied
        this.appliedFixes.push(...fileFixes);
      } catch (error) {
        // Log error for debugging
        console.error(`Error applying fixes to ${filePath}:`, error.message);
        
        // Mark all fixes for this file as failed
        for (const fix of fileFixes) {
          this.failedFixes.push({
            fix,
            error: error.message
          });
        }
      }
    }

    return {
      applied: this.appliedFixes,
      failed: this.failedFixes,
      backupPaths: Array.from(this.backups.values())
    };
  }

  /**
   * Apply fixes to a specific file
   * @private
   * @param {string} filePath - Path to file
   * @param {Fix[]} fixes - Fixes to apply to this file
   * @returns {Promise<void>}
   */
  async _applyFixesToFile(filePath, fixes) {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Determine file type and apply appropriate fixes
    if (filePath.endsWith('.html')) {
      await this._applyHTMLFixes(filePath, content, fixes);
    } else if (filePath.endsWith('.js')) {
      await this._applyJavaScriptFixes(filePath, content, fixes);
    } else {
      throw new Error(`Unsupported file type: ${filePath}`);
    }
  }

  /**
   * Apply fixes to HTML file
   * @private
   * @param {string} filePath - Path to HTML file
   * @param {string} content - File content
   * @param {Fix[]} fixes - Fixes to apply
   * @returns {Promise<void>}
   */
  async _applyHTMLFixes(filePath, content, fixes) {
    let lines = content.split('\n');

    // Sort fixes by line number in descending order to avoid line number shifts
    const sortedFixes = [...fixes].sort((a, b) => b.lineNumber - a.lineNumber);

    for (const fix of sortedFixes) {
      if (fix.type === 'remove-handler') {
        // Remove event handler attribute from the line
        const lineIndex = fix.lineNumber - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const line = lines[lineIndex];
          const eventType = fix.metadata.eventType;
          
          // Remove the event handler attribute
          // Match patterns like onclick="functionName()" or onclick='functionName()'
          const regex = new RegExp(`\\s*${eventType}\\s*=\\s*["'][^"']*["']`, 'g');
          lines[lineIndex] = line.replace(regex, '');
          
          console.log(`Removed ${eventType} handler from line ${fix.lineNumber}`);
        }
      }
    }

    // Write modified content back
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
  }

  /**
   * Apply fixes to JavaScript file
   * @private
   * @param {string} filePath - Path to JavaScript file
   * @param {string} content - File content
   * @param {Fix[]} fixes - Fixes to apply
   * @returns {Promise<void>}
   */
  async _applyJavaScriptFixes(filePath, content, fixes) {
    // Parse JavaScript file
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    // Track which functions to remove
    const functionsToRemove = new Set();
    for (const fix of fixes) {
      if (fix.type === 'remove-function') {
        functionsToRemove.add(fix.metadata.functionName);
      }
    }

    // Remove function declarations
    ast.program.body = ast.program.body.filter(node => {
      // Remove function declarations
      if (node.type === 'FunctionDeclaration' && functionsToRemove.has(node.id.name)) {
        console.log(`Removed function declaration: ${node.id.name}`);
        return false;
      }

      // Remove variable declarations with function expressions
      if (node.type === 'VariableDeclaration') {
        node.declarations = node.declarations.filter(declarator => {
          if (declarator.id.type === 'Identifier' && functionsToRemove.has(declarator.id.name)) {
            if (declarator.init && 
                (declarator.init.type === 'FunctionExpression' || 
                 declarator.init.type === 'ArrowFunctionExpression')) {
              console.log(`Removed function expression: ${declarator.id.name}`);
              return false;
            }
          }
          return true;
        });
        
        // Remove the entire variable declaration if all declarators were removed
        return node.declarations.length > 0;
      }

      return true;
    });

    // Generate code from modified AST
    const output = generate(ast, {
      retainLines: true,
      comments: true
    });

    // Write modified content back
    await fs.writeFile(filePath, output.code, 'utf-8');
  }

  /**
   * Rollback all changes by restoring from backups
   * @returns {Promise<void>}
   */
  async rollback() {
    for (const [originalPath, backupPath] of this.backups.entries()) {
      try {
        await fs.copy(backupPath, originalPath, { overwrite: true });
        console.log(`Restored ${originalPath} from backup`);
      } catch (error) {
        console.error(`Failed to restore ${originalPath}: ${error.message}`);
      }
    }

    // Clean up backup directory
    try {
      await fs.remove(this.backupDir);
      console.log(`Removed backup directory: ${this.backupDir}`);
    } catch (error) {
      console.error(`Failed to remove backup directory: ${error.message}`);
    }

    // Clear tracking
    this.backups.clear();
  }

  /**
   * Generate summary of fixes
   * @returns {Object} Fix summary with statistics
   */
  generateFixSummary() {
    const summary = {
      totalFixes: this.appliedFixes.length + this.failedFixes.length,
      appliedCount: this.appliedFixes.length,
      failedCount: this.failedFixes.length,
      backupCount: this.backups.size,
      applied: this.appliedFixes.map(fix => ({
        type: fix.type,
        description: fix.description,
        filePath: fix.filePath,
        lineNumber: fix.lineNumber
      })),
      failed: this.failedFixes.map(({ fix, error }) => ({
        type: fix.type,
        description: fix.description,
        filePath: fix.filePath,
        lineNumber: fix.lineNumber,
        error: error
      })),
      backups: Array.from(this.backups.entries()).map(([original, backup]) => ({
        original,
        backup
      }))
    };

    return summary;
  }
}

export default AutoFixer;
