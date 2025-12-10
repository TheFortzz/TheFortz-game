/**
 * ReportGenerator - Generates audit reports in various formats
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * @typedef {import('../types/index.js').AnalysisResults} AnalysisResults
 */

class ReportGenerator {
  /**
   * Create a ReportGenerator instance
   * @param {AnalysisResults} analysisResults - Results from the analyzer
   */
  constructor(analysisResults) {
    this.results = analysisResults;
  }

  /**
   * Classify issue severity
   * @param {string} issueType - Type of issue
   * @returns {'critical'|'warning'|'info'} Severity level
   */
  _classifySeverity(issueType) {
    const severityMap = {
      brokenHandlers: 'critical',
      orphanedFunctions: 'warning',
      nonFunctionalElements: 'warning',
      unusedFunctions: 'info',
      patternIssues: 'info'
    };
    return severityMap[issueType] || 'info';
  }

  /**
   * Get all issues sorted by severity
   * @returns {Array<{type: string, severity: string, issues: any[]}>} Sorted issues
   */
  _getIssuesBySeverity() {
    const issueGroups = [
      { type: 'brokenHandlers', severity: 'critical', issues: this.results.brokenHandlers },
      { type: 'orphanedFunctions', severity: 'warning', issues: this.results.orphanedFunctions },
      { type: 'nonFunctionalElements', severity: 'warning', issues: this.results.nonFunctionalElements },
      { type: 'unusedFunctions', severity: 'info', issues: this.results.unusedFunctions },
      { type: 'patternIssues', severity: 'info', issues: this.results.patternIssues }
    ];

    // Sort pattern issues by their own severity
    issueGroups.forEach(group => {
      if (group.type === 'patternIssues') {
        group.issues = [...group.issues].sort((a, b) => {
          const severityOrder = { critical: 0, warning: 1, info: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });
      }
    });

    return issueGroups;
  }

  /**
   * Count total issues by severity
   * @returns {{critical: number, warning: number, info: number, total: number}} Issue counts
   */
  _countIssues() {
    let critical = this.results.brokenHandlers.length;
    let warning = this.results.orphanedFunctions.length + this.results.nonFunctionalElements.length;
    let info = this.results.unusedFunctions.length;

    // Add pattern issues by their severity
    this.results.patternIssues.forEach(issue => {
      if (issue.severity === 'critical') critical++;
      else if (issue.severity === 'warning') warning++;
      else info++;
    });

    return {
      critical,
      warning,
      info,
      total: critical + warning + info
    };
  }

  /**
   * Format file path for display (relative to project root)
   * @param {string} filePath - Absolute or relative file path
   * @returns {string} Formatted path
   */
  _formatPath(filePath) {
    // Remove leading './' or '../' for cleaner display
    return filePath.replace(/^\.\.?\//, '');
  }

  /**
   * Escape markdown special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeMarkdown(text) {
    return text.replace(/([*_`[\]()#+\-.!])/g, '\\$1');
  }

  /**
   * Generate markdown report
   * @returns {string} Markdown formatted report
   */
  generateMarkdown() {
    const counts = this._countIssues();
    let markdown = '';

    // Title
    markdown += '# JavaScript-HTML Connection Audit Report\n\n';
    markdown += `*Generated on ${new Date().toLocaleString()}*\n\n`;

    // Executive Summary
    markdown += '## Executive Summary\n\n';
    markdown += `- **Total Issues**: ${counts.total}\n`;
    markdown += `- **Critical**: ${counts.critical}\n`;
    markdown += `- **Warnings**: ${counts.warning}\n`;
    markdown += `- **Info**: ${counts.info}\n\n`;

    if (counts.total === 0) {
      markdown += '✅ **No issues found!** Your JavaScript-HTML connections are in good shape.\n\n';
      return markdown;
    }

    markdown += '---\n\n';

    // Orphaned Functions Section
    markdown += this._generateOrphanedFunctionsSection();

    // Broken Event Handlers Section
    markdown += this._generateBrokenHandlersSection();

    // Unused Functions Section
    markdown += this._generateUnusedFunctionsSection();

    // Non-Functional Elements Section
    markdown += this._generateNonFunctionalElementsSection();

    // UI Pattern Issues Section
    markdown += this._generatePatternIssuesSection();

    // Recommendations Section
    markdown += this._generateRecommendationsSection();

    return markdown;
  }

  /**
   * Generate orphaned functions section
   * @private
   * @returns {string} Markdown section
   */
  _generateOrphanedFunctionsSection() {
    if (this.results.orphanedFunctions.length === 0) {
      return '';
    }

    let section = '## 1. Orphaned Functions ⚠️\n\n';
    section += `**${this.results.orphanedFunctions.length} function(s)** reference HTML elements that don't exist.\n\n`;

    // Group by missing element ID
    const grouped = new Map();
    this.results.orphanedFunctions.forEach(orphan => {
      if (!grouped.has(orphan.missingElementId)) {
        grouped.set(orphan.missingElementId, []);
      }
      grouped.get(orphan.missingElementId).push(orphan);
    });

    grouped.forEach((orphans, elementId) => {
      section += `### Missing Element: \`${elementId}\`\n\n`;
      section += `Referenced by ${orphans.length} location(s):\n\n`;
      
      orphans.forEach(orphan => {
        section += `- **Function**: \`${orphan.functionName}\`\n`;
        section += `  - **File**: \`${this._formatPath(orphan.filePath)}\`\n`;
        section += `  - **Line**: ${orphan.lineNumber}\n`;
        section += `  - **Method**: \`${orphan.queryMethod}\`\n\n`;
      });
    });

    section += '---\n\n';
    return section;
  }

  /**
   * Generate broken event handlers section
   * @private
   * @returns {string} Markdown section
   */
  _generateBrokenHandlersSection() {
    if (this.results.brokenHandlers.length === 0) {
      return '';
    }

    let section = '## 2. Broken Event Handlers 🔴\n\n';
    section += `**${this.results.brokenHandlers.length} event handler(s)** call functions that don't exist.\n\n`;

    this.results.brokenHandlers.forEach((handler, index) => {
      section += `### ${index + 1}. Missing Function: \`${handler.missingFunction}\`\n\n`;
      section += `- **Element ID**: ${handler.elementId ? `\`${handler.elementId}\`` : '*No ID*'}\n`;
      section += `- **Event Type**: \`${handler.eventType}\`\n`;
      section += `- **HTML Line**: ${handler.htmlLineNumber}\n\n`;
    });

    section += '---\n\n';
    return section;
  }

  /**
   * Generate unused functions section
   * @private
   * @returns {string} Markdown section
   */
  _generateUnusedFunctionsSection() {
    if (this.results.unusedFunctions.length === 0) {
      return '';
    }

    let section = '## 3. Unused Functions ℹ️\n\n';
    section += `**${this.results.unusedFunctions.length} function(s)** are defined but never called.\n\n`;

    // Group by file
    const grouped = new Map();
    this.results.unusedFunctions.forEach(func => {
      if (!grouped.has(func.filePath)) {
        grouped.set(func.filePath, []);
      }
      grouped.get(func.filePath).push(func);
    });

    grouped.forEach((functions, filePath) => {
      section += `### File: \`${this._formatPath(filePath)}\`\n\n`;
      
      functions.forEach(func => {
        section += `- \`${func.functionName}\` (line ${func.lineNumber})\n`;
      });
      
      section += '\n';
    });

    section += '---\n\n';
    return section;
  }

  /**
   * Generate non-functional elements section
   * @private
   * @returns {string} Markdown section
   */
  _generateNonFunctionalElementsSection() {
    if (this.results.nonFunctionalElements.length === 0) {
      return '';
    }

    let section = '## 4. Non-Functional Interactive Elements ⚠️\n\n';
    section += `**${this.results.nonFunctionalElements.length} interactive element(s)** have no event handlers or JavaScript references.\n\n`;

    this.results.nonFunctionalElements.forEach((element, index) => {
      section += `${index + 1}. **${element.tagName.toUpperCase()}**`;
      if (element.elementId) {
        section += ` (ID: \`${element.elementId}\`)`;
      }
      section += `\n`;
      section += `   - **HTML Line**: ${element.htmlLineNumber}\n`;
      section += `   - **Reason**: ${element.reason}\n\n`;
    });

    section += '---\n\n';
    return section;
  }

  /**
   * Generate UI pattern issues section
   * @private
   * @returns {string} Markdown section
   */
  _generatePatternIssuesSection() {
    if (this.results.patternIssues.length === 0) {
      return '';
    }

    let section = '## 5. UI Pattern Issues ℹ️\n\n';
    section += `**${this.results.patternIssues.length} UI pattern(s)** are incomplete.\n\n`;

    // Group by pattern type
    const grouped = new Map();
    this.results.patternIssues.forEach(issue => {
      if (!grouped.has(issue.pattern)) {
        grouped.set(issue.pattern, []);
      }
      grouped.get(issue.pattern).push(issue);
    });

    grouped.forEach((issues, pattern) => {
      section += `### ${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Patterns\n\n`;
      
      issues.forEach(issue => {
        const severityIcon = issue.severity === 'critical' ? '🔴' : 
                            issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        section += `- ${severityIcon} **Element**: \`${issue.elementId}\`\n`;
        section += `  - **Missing**: ${issue.missingComponents.join(', ')}\n\n`;
      });
    });

    section += '---\n\n';
    return section;
  }

  /**
   * Generate recommendations section
   * @private
   * @returns {string} Markdown section
   */
  _generateRecommendationsSection() {
    let section = '## Recommendations\n\n';

    const counts = this._countIssues();

    if (counts.critical > 0) {
      section += '### 🔴 Critical Priority\n\n';
      section += '1. **Fix broken event handlers** - These prevent user interactions from working\n';
      section += '   - Add missing function definitions\n';
      section += '   - Or remove the event handlers if they\'re no longer needed\n\n';
    }

    if (this.results.orphanedFunctions.length > 0) {
      section += '### ⚠️ High Priority\n\n';
      section += '2. **Fix orphaned functions** - These query non-existent elements\n';
      section += '   - Add missing HTML elements with the correct IDs\n';
      section += '   - Or update the JavaScript to use correct element IDs\n';
      section += '   - Or remove the orphaned code if it\'s no longer needed\n\n';
    }

    if (this.results.nonFunctionalElements.length > 0) {
      section += '3. **Add handlers to interactive elements** - These elements appear clickable but do nothing\n';
      section += '   - Add event handlers to make them functional\n';
      section += '   - Or remove them if they\'re not needed\n\n';
    }

    if (this.results.unusedFunctions.length > 0) {
      section += '### ℹ️ Low Priority\n\n';
      section += '4. **Remove unused functions** - These increase bundle size unnecessarily\n';
      section += '   - Review each function to confirm it\'s truly unused\n';
      section += '   - Remove dead code to improve maintainability\n\n';
    }

    if (this.results.patternIssues.length > 0) {
      section += '5. **Complete UI patterns** - These may indicate incomplete features\n';
      section += '   - Review each pattern to ensure all components are present\n';
      section += '   - Add missing open/close functions for modals\n';
      section += '   - Add missing switch functions for tabs\n';
      section += '   - Add missing submit handlers for forms\n\n';
    }

    section += '### 🛠️ Automated Fixes\n\n';
    section += 'Some issues can be fixed automatically:\n';
    section += '- Run with `--fix` flag to remove unused functions (with backup)\n';
    section += '- Review the changes before committing\n\n';

    return section;
  }

  /**
   * Generate JSON report
   * @returns {object} JSON structured report
   */
  generateJSON() {
    const counts = this._countIssues();

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        toolVersion: '1.0.0'
      },
      summary: {
        totalIssues: counts.total,
        critical: counts.critical,
        warning: counts.warning,
        info: counts.info
      },
      issues: {
        orphanedFunctions: this.results.orphanedFunctions.map(orphan => ({
          severity: 'warning',
          functionName: orphan.functionName,
          filePath: this._formatPath(orphan.filePath),
          lineNumber: orphan.lineNumber,
          missingElementId: orphan.missingElementId,
          queryMethod: orphan.queryMethod
        })),
        brokenHandlers: this.results.brokenHandlers.map(handler => ({
          severity: 'critical',
          elementId: handler.elementId,
          eventType: handler.eventType,
          missingFunction: handler.missingFunction,
          htmlLineNumber: handler.htmlLineNumber
        })),
        unusedFunctions: this.results.unusedFunctions.map(func => ({
          severity: 'info',
          functionName: func.functionName,
          filePath: this._formatPath(func.filePath),
          lineNumber: func.lineNumber,
          callCount: func.callCount
        })),
        nonFunctionalElements: this.results.nonFunctionalElements.map(element => ({
          severity: 'warning',
          elementId: element.elementId,
          tagName: element.tagName,
          htmlLineNumber: element.htmlLineNumber,
          reason: element.reason
        })),
        patternIssues: this.results.patternIssues.map(issue => ({
          severity: issue.severity,
          pattern: issue.pattern,
          elementId: issue.elementId,
          missingComponents: issue.missingComponents
        }))
      },
      recommendations: this._generateRecommendationsJSON()
    };
  }

  /**
   * Generate recommendations in JSON format
   * @private
   * @returns {Array<{priority: string, title: string, description: string}>} Recommendations
   */
  _generateRecommendationsJSON() {
    const recommendations = [];
    const counts = this._countIssues();

    if (counts.critical > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Fix broken event handlers',
        description: 'These prevent user interactions from working. Add missing function definitions or remove unused event handlers.'
      });
    }

    if (this.results.orphanedFunctions.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Fix orphaned functions',
        description: 'These query non-existent elements. Add missing HTML elements, update JavaScript to use correct IDs, or remove orphaned code.'
      });
    }

    if (this.results.nonFunctionalElements.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Add handlers to interactive elements',
        description: 'These elements appear clickable but do nothing. Add event handlers or remove unnecessary elements.'
      });
    }

    if (this.results.unusedFunctions.length > 0) {
      recommendations.push({
        priority: 'low',
        title: 'Remove unused functions',
        description: 'These increase bundle size unnecessarily. Review and remove dead code to improve maintainability.'
      });
    }

    if (this.results.patternIssues.length > 0) {
      recommendations.push({
        priority: 'low',
        title: 'Complete UI patterns',
        description: 'These may indicate incomplete features. Add missing components for modals, tabs, forms, and navigation.'
      });
    }

    return recommendations;
  }

  /**
   * Save report to file
   * @param {'markdown'|'json'|'both'} format - Report format
   * @param {string} outputPath - Output directory path
   * @returns {Promise<{markdown?: string, json?: string}>} Paths to saved files
   */
  async saveReport(format = 'both', outputPath = './output') {
    // Ensure output directory exists
    await fs.ensureDir(outputPath);

    const savedFiles = {};

    if (format === 'markdown' || format === 'both') {
      const markdown = this.generateMarkdown();
      const markdownPath = path.join(outputPath, 'audit-report.md');
      await fs.writeFile(markdownPath, markdown, 'utf8');
      savedFiles.markdown = markdownPath;
    }

    if (format === 'json' || format === 'both') {
      const json = this.generateJSON();
      const jsonPath = path.join(outputPath, 'audit-report.json');
      await fs.writeFile(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      savedFiles.json = jsonPath;
    }

    return savedFiles;
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const counts = this._countIssues();

    console.log('\n' + '='.repeat(60));
    console.log('  JavaScript-HTML Connection Audit Summary');
    console.log('='.repeat(60) + '\n');

    // Overall statistics
    console.log('📊 Overall Statistics:');
    console.log(`   Total Issues: ${counts.total}`);
    console.log(`   🔴 Critical: ${counts.critical}`);
    console.log(`   ⚠️  Warning: ${counts.warning}`);
    console.log(`   ℹ️  Info: ${counts.info}\n`);

    if (counts.total === 0) {
      console.log('✅ No issues found! Your JavaScript-HTML connections are in good shape.\n');
      console.log('='.repeat(60) + '\n');
      return;
    }

    // Top issues by category
    console.log('🔍 Issues by Category:\n');

    if (this.results.brokenHandlers.length > 0) {
      console.log(`   🔴 Broken Event Handlers: ${this.results.brokenHandlers.length}`);
      const topBroken = this.results.brokenHandlers.slice(0, 3);
      topBroken.forEach(handler => {
        console.log(`      - Missing function: ${handler.missingFunction}`);
      });
      if (this.results.brokenHandlers.length > 3) {
        console.log(`      ... and ${this.results.brokenHandlers.length - 3} more`);
      }
      console.log('');
    }

    if (this.results.orphanedFunctions.length > 0) {
      console.log(`   ⚠️  Orphaned Functions: ${this.results.orphanedFunctions.length}`);
      const topOrphaned = this.results.orphanedFunctions.slice(0, 3);
      topOrphaned.forEach(orphan => {
        console.log(`      - ${orphan.functionName} → missing element: ${orphan.missingElementId}`);
      });
      if (this.results.orphanedFunctions.length > 3) {
        console.log(`      ... and ${this.results.orphanedFunctions.length - 3} more`);
      }
      console.log('');
    }

    if (this.results.nonFunctionalElements.length > 0) {
      console.log(`   ⚠️  Non-Functional Elements: ${this.results.nonFunctionalElements.length}`);
      const topNonFunc = this.results.nonFunctionalElements.slice(0, 3);
      topNonFunc.forEach(element => {
        const id = element.elementId ? `#${element.elementId}` : element.tagName;
        console.log(`      - ${id}`);
      });
      if (this.results.nonFunctionalElements.length > 3) {
        console.log(`      ... and ${this.results.nonFunctionalElements.length - 3} more`);
      }
      console.log('');
    }

    if (this.results.unusedFunctions.length > 0) {
      console.log(`   ℹ️  Unused Functions: ${this.results.unusedFunctions.length}`);
      const topUnused = this.results.unusedFunctions.slice(0, 3);
      topUnused.forEach(func => {
        console.log(`      - ${func.functionName} (${this._formatPath(func.filePath)})`);
      });
      if (this.results.unusedFunctions.length > 3) {
        console.log(`      ... and ${this.results.unusedFunctions.length - 3} more`);
      }
      console.log('');
    }

    if (this.results.patternIssues.length > 0) {
      console.log(`   ℹ️  UI Pattern Issues: ${this.results.patternIssues.length}`);
      const topPatterns = this.results.patternIssues.slice(0, 3);
      topPatterns.forEach(issue => {
        console.log(`      - ${issue.pattern}: ${issue.elementId}`);
      });
      if (this.results.patternIssues.length > 3) {
        console.log(`      ... and ${this.results.patternIssues.length - 3} more`);
      }
      console.log('');
    }

    // Recommendations
    console.log('💡 Top Recommendations:\n');

    if (counts.critical > 0) {
      console.log('   1. 🔴 Fix broken event handlers (CRITICAL)');
      console.log('      These prevent user interactions from working\n');
    }

    if (this.results.orphanedFunctions.length > 0) {
      console.log('   2. ⚠️  Fix orphaned functions');
      console.log('      These query non-existent HTML elements\n');
    }

    if (this.results.nonFunctionalElements.length > 0) {
      console.log('   3. ⚠️  Add handlers to interactive elements');
      console.log('      These elements appear clickable but do nothing\n');
    }

    console.log('📄 See full report for detailed information and all issues.\n');
    console.log('='.repeat(60) + '\n');
  }
}

export default ReportGenerator;
